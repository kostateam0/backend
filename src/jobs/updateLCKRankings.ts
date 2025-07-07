import cron from "node-cron";
import { fetchLCKRankings } from "../services/lol/fetchLCKRankings";
import prisma from "../lib/prisma";

const LEAGUE = "LCK";
const SEASON = "2025 Spring";

// 순위 최신화 함수
async function updateLCKRankingsJob() {
  try {
    const rankings = await fetchLCKRankings();
    await prisma.esportsRanking.upsert({
      where: { league_season: { league: LEAGUE, season: SEASON } },
      update: { data: rankings },
      create: { league: LEAGUE, season: SEASON, data: rankings },
    });
    // 실행 시간 기록 (별도 테이블이 있으면 거기에 기록, 아니면 updatedAt 활용)
    console.log("[CRON] LCK 순위 최신화 완료");
  } catch (error) {
    console.error("[CRON] LCK 순위 최신화 실패:", error);
  }
}

// 서버 시작 시 지난 실행 시간 체크 후 필요하면 즉시 실행
(async () => {
  const latest = await prisma.esportsRanking.findFirst({
    where: { league: LEAGUE, season: SEASON },
    orderBy: { updatedAt: "desc" },
  });
  const now = new Date();
  if (
    !latest ||
    !latest.updatedAt ||
    now.getTime() - latest.updatedAt.getTime() > 1000 * 60 * 60 * 23.5
  ) {
    // 23.5시간 이상 지났으면 즉시 실행 (여유를 둠)
    await updateLCKRankingsJob();
  }
})();

// 24시간마다 크론 등록
cron.schedule("0 0 * * *", updateLCKRankingsJob);
