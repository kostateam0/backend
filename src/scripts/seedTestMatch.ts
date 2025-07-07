/**
 * 실행:  node -r ts-node/register scripts/quickSettleTest.ts
 *  - 서버 (npm run dev 등)가 켜져 있어야 /api 호출 성공
 */
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();
const MID = 123456;            // 더미 matchId
const USERS = ["A", "B", "C", "D"];  // 4유저 → 3승 1패 예시

(async () => {
  /* 1) 유저 4명 생성 & 초기 포인트 1000 */
  const userDocs = await Promise.all(
    USERS.map((name) =>
      prisma.user.upsert({
        where: { email: `${name}@test.com` },
        update: { point: 1000 },
        create: { email: `${name}@test.com`, password: "x", name },
      })
    )
  );

  /* 2) 더미 경기 생성 (승자 blue) */
  await prisma.match.upsert({
    where: { matchId: MID },
    update: { result: "blue", settled: false },
    create: {
      matchId: MID,
      name: "BLUE vs RED (TEST)",
      blueTeam: "BLUE",
      redTeam: "RED",
      startTime: new Date(Date.now() - 3_600_000), // 1시간 전
      result: "blue",
    },
  });

  /* 3) 베팅: 첫 3명 BLUE(승) · 마지막 1명 RED(패) */
  await prisma.$transaction([
    ...userDocs.slice(0, 3).map((u) =>
      prisma.bet.create({ data: { matchId: MID, team: "blue", amount: 100, userId: u.id } })
    ),
    prisma.bet.create({ data: { matchId: MID, team: "red", amount: 100, userId: userDocs[3].id } }),
    ...userDocs.map((u) =>
      prisma.user.update({ where: { id: u.id }, data: { point: { decrement: 100 } } })
    ),
  ]);

  console.log("✅ 더미 경기·베팅 삽입 완료");

  /* 4) 정산 API 호출 */
  const r = await fetch(`http://localhost:4000/api/bet/settle/${MID}`, { method: "POST" });
  console.log("🪙 정산 응답:", await r.json());

  /* 5) 포인트 확인 */
  const pts = await prisma.user.findMany({ where: { email: { contains: "@test.com" } } });
  pts.forEach((u) => console.log(`${u.email} → ${u.point}`));
  await prisma.$disconnect();
})();
