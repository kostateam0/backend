import cron from "node-cron";
import { fetchLCKRankings } from "../services/lol/fetchLCKRankings";
import prisma from "../lib/prisma";

// 24시간마다 LCK 순위 최신화
cron.schedule("0 0 * * *", async () => {
  try {
    const rankings = await fetchLCKRankings();
    await prisma.esportsRanking.upsert({
      where: { league_season: { league: "LCK", season: "2025 Spring" } },
      update: { data: rankings },
      create: {
        league: "LCK",
        season: "2025 Spring",
        data: rankings,
      },
    });
    console.log("[CRON] LCK 순위 최신화 완료");
  } catch (error) {
    console.error("[CRON] LCK 순위 최신화 실패:", error);
  }
});
