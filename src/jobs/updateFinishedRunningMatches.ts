// src/jobs/updateFinishedRunningMatches.ts

import { fetchRunningMatches } from "../services/lol/fetchRunningMatches";
import { fetchPastMatches } from "../services/lol/fetchPastMatches";
import { settleMatchById } from "../services/lol/settleMatchById";
import prisma from "../lib/prisma";

export const updateFinishedRunningMatches = async () => {
  try {
    const runningMatches = await fetchRunningMatches();
    const pastMatches = await fetchPastMatches(30);

    for (const runningMatch of runningMatches) {
      const finishedMatch = pastMatches.find(
        (m: { matchId: any; }) => m.matchId === runningMatch.matchId
      );

      if (finishedMatch) {
        // 1. DB 업데이트
        await prisma.match.update({
          where: { matchId: finishedMatch.matchId },
          data: {
            winner: finishedMatch.winner,
            endTime: new Date(finishedMatch.endTime),
            updatedAt: new Date(),
          },
        });

        console.log(`✅ 종료된 경기 업데이트됨: ${finishedMatch.name}`);

        // 2. match.result를 자동 설정 (winner와 blueTeam 비교)
        const dbMatch = await prisma.match.findUnique({
          where: { matchId: finishedMatch.matchId },
        });

        if (dbMatch) {
          const result =
            dbMatch.winner === dbMatch.blueTeam
              ? "blue"
              : dbMatch.winner === dbMatch.redTeam
              ? "red"
              : null;

          // result가 유효하면 업데이트 (자동 설정)
          if (result && !dbMatch.result) {
            await prisma.match.update({
              where: { matchId: dbMatch.matchId },
              data: { result },
            });
          }

          // 3. 자동 정산 조건 확인 후 정산 실행
          if (!dbMatch.settled && ["blue", "red"].includes(result ?? "")) {
            await settleMatchById(dbMatch.matchId);
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ 진행 중 경기 상태 업데이트 실패:", err);
  }
};
