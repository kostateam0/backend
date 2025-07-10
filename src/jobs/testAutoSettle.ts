import prisma from "../lib/prisma";
import { updateFinishedRunningMatches } from "./updateFinishedRunningMatches";

const matchId = 999999;

const seedTestData = async () => {
  console.log("🛠️ 시드 데이터 생성 중...");

  // ✅ 유저 3명 생성
  const [user1, user2, user3] = await Promise.all([
    prisma.user.upsert({
      where: { email: "test-user1@example.com" },
      update: {},
      create: {
        email: "test-user1@example.com",
        name: "User1",
        point: 1000,
        password: "test1234",
      },
    }),
    prisma.user.upsert({
      where: { email: "test-user2@example.com" },
      update: {},
      create: {
        email: "test-user2@example.com",
        name: "User2",
        point: 1000,
        password: "test1234",
      },
    }),
    prisma.user.upsert({
      where: { email: "test-user3@example.com" },
      update: {},
      create: {
        email: "test-user3@example.com",
        name: "User3",
        point: 1000,
        password: "test1234",
      },
    }),
  ]);
  

  await prisma.match.upsert({
    where: { matchId },
    update: {
      winner: "T1",
      result: "blue", // ✅ 추가
      endTime: new Date(),
      settled: false,
    },
    create: {
      matchId,
      name: "T1 vs G2",
      blueTeam: "T1",
      redTeam: "G2",
      winner: "T1",
      result: "blue", // ✅ 추가
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(),
      settled: false,
      league: "MSI",
    },
  });
  

  // ✅ 기존 베팅 제거 후 베팅 생성
  await prisma.bet.deleteMany({ where: { matchId } });

  await prisma.bet.createMany({
    data: [
      { userId: user1.id, matchId, amount: 300, team: "blue" }, // ✅ 승자
      { userId: user2.id, matchId, amount: 150, team: "red" },  // ❌ 패자
      { userId: user3.id, matchId, amount: 50,  team: "red" },  // ❌ 패자
    ],
  });

  console.log("✅ 시드 완료");
};

const verifyResults = async () => {
  const [user1, user2, user3] = await Promise.all([
    prisma.user.findUnique({ where: { email: "test-user1@example.com" } }),
    prisma.user.findUnique({ where: { email: "test-user2@example.com" } }),
    prisma.user.findUnique({ where: { email: "test-user3@example.com" } }),
  ]);

  const match = await prisma.match.findUnique({ where: { matchId } });

  console.log("\n📊 [정산 결과]");
  console.log(`🏆 ${user1?.name} (BLUE팀) 최종 포인트: ${user1?.point}`);
  console.log(`💸 ${user2?.name} (RED팀)  최종 포인트: ${user2?.point}`);
  console.log(`💸 ${user3?.name} (RED팀)  최종 포인트: ${user3?.point}`);
  console.log(`📌 Match Settled: ${match?.settled}`);
  console.log(`📌 Result: ${match?.result}`);
};

(async () => {
  await seedTestData();

  console.log("\n🚀 자동 정산 실행 중...");
  await updateFinishedRunningMatches();

  await verifyResults();
  process.exit();
})();
