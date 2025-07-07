// 팀 로스터 DB 조회 API
export const getEsportsRoster = async (req: Request, res: Response) => {
  const { league, season } = req.query;
  if (!league || !season) {
    res
      .status(400)
      .json({ error: "league, season 쿼리 파라미터가 필요합니다." });
    return;
  }
  try {
    const roster = await prisma.esportsRoster.findFirst({
      where: { league: String(league), season: String(season) },
      orderBy: { updatedAt: "desc" },
    });
    if (!roster) {
      res
        .status(404)
        .json({ error: "해당 리그/시즌의 로스터 데이터가 없습니다." });
      return;
    }
    res.json(roster.data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
import { Request, Response } from "express";
import { fetchUpcomingMatches } from "../../services/lol/fetchUpcomingMatches";
import { fetchTeamsBySeries } from "../../services/lol/fetchTeamsBySeries";
import { fetchLCKRankings } from "../../services/lol/fetchLCKRankings";
import { fetchGameResults } from "../../services/lol/fetchGameResults";
import prisma from "../../lib/prisma";
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

// LCK 순위표를 DB에서 조회, 없으면 계산 후 저장
export const getLCKRankings = async (req: Request, res: Response) => {
  try {
    // 최신 데이터 1개만 조회
    const latest = await prisma.esportsRanking.findFirst({
      where: { league: "LCK", season: "2025 Spring" },
      orderBy: { updatedAt: "desc" },
    });
    if (latest && Array.isArray(latest.data) && latest.data.length > 0) {
      res.json(latest.data); // ✅ 그냥 응답만 보내고 return은 생략
      return;
    }
    // 없으면 계산해서 저장
    const teams = await fetchLCKRankings();
    await prisma.esportsRanking.create({
      data: {
        league: "LCK",
        season: "2025 Spring",
        data: teams,
      },
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGameResults = async (req: Request, res: Response) => {
  try {
    const results = await fetchGameResults();
    res.status(200).json(results);
  } catch (error) {
    console.error("최근 경기 결과 조회 실패:", error);
    res.status(500).json({ message: "최근 경기 결과를 불러오지 못했습니다." });
  }
};
