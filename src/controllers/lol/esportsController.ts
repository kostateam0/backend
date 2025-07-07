import { Request, Response } from "express";
import { fetchUpcomingMatches } from "../../services/lol/fetchUpcomingMatches";
import { fetchTeamsBySeries } from "../../services/lol/fetchTeamsBySeries";
import { fetchLCKRankings } from "../../services/lol/fetchLCKRankings";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUpcomingMatches = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    /* ① DB에 12시간 내 갱신된 경기 리스트가 있는지 확인 */
    const cached = await prisma.match.findMany({
      where: {
        startTime: { gte: now },
        updatedAt: { gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) }, // 12h TTL
      },
      orderBy: { startTime: "asc" },
    });

    if (cached.length) {
      res.status(200).json(cached);   // 바로 반환 (외부 API 호출 X)
      return;
    }

    /* ② 없으면 외부 API -> upsert -> 반환 */
    const apiMatches = await fetchUpcomingMatches();

    await prisma.$transaction(
      apiMatches.map((m: any) =>
        prisma.match.upsert({
          where: { matchId: m.matchId },
          update: {
            name: m.name,
            league: m.league,
            blueTeam: m.blueTeam,
            redTeam: m.redTeam,
            startTime: new Date(m.startTime),
          },
          create: {
            matchId: m.matchId,
            name: m.name,
            league: m.league,
            blueTeam: m.blueTeam,
            redTeam: m.redTeam,
            startTime: new Date(m.startTime),
          },
        })
      )
    );

    const matches = await prisma.match.findMany({
      where: { startTime: { gte: now } },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json(matches);
  } catch (error) {
    console.error("다가올 경기 저장/조회 실패:", error);
    res.status(500).json({ message: "e스포츠 경기 정보를 불러오지 못했습니다." });
  }
};

export const getTeamsBySeries = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { seriesId } = req.query;
  if (!seriesId) {
    res.status(400).json({ error: "seriesId가 필요합니다." });
    return;
  }
  try {
    const teams = await fetchTeamsBySeries(Number(seriesId));
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLCKRankings = async (req: Request, res: Response) => {
  try {
    const teams = await fetchLCKRankings();
    res.json(teams);
  } catch (error) {
    console.error("LCK 팀 순위 조회 실패:", error);
    res.status(500).json({ message: "LCK 팀 순위를 불러오지 못했습니다." });
  }
};
