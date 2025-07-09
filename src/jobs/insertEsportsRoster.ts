import prisma from "../lib/prisma";
import { fetchTeamsBySeries } from "../services/lol/fetchTeamsBySeries";

// 리그별 시리즈ID 및 시즌 매핑
const LEAGUE_SERIES = [
  { league: "LCK", season: "2025 Spring", seriesId: 9164 },
  { league: "LPL", season: "2025 Spring", seriesId: 9152 },
  { league: "MSI", season: "2025", seriesId: 9418 },
];

async function main() {
  for (const { league, season, seriesId } of LEAGUE_SERIES) {
    console.log(`Fetching ${league} ${season}...`);
    const teams = await fetchTeamsBySeries(seriesId);
    // Prisma upsert: 이미 있으면 업데이트, 없으면 생성
    await prisma.esportsRoster.upsert({
      where: { league_season_roster: { league, season } },
      update: { data: teams },
      create: { league, season, data: teams },
    });
    console.log(`Inserted/Updated: ${league} ${season}`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
