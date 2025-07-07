import { Request, Response } from "express";
import { fetchUpcomingMatches } from "../../services/lol/fetchUpcomingMatches";
import { fetchTeamsBySeries } from "../../services/lol/fetchTeamsBySeries";
import { fetchLCKRankings } from "../../services/lol/fetchLCKRankings";
import { fetchGameResults } from "../../services/lol/fetchGameResults";
import prisma from "../../lib/prisma";

export const getUpcomingMatches = async (req: Request, res: Response) => {
  try {
    const matches = await fetchUpcomingMatches();
    res.status(200).json(matches);
  } catch (error) {
    console.error("다가올 e스포츠 경기 조회 실패:", error);
    res
      .status(500)
      .json({ message: "e스포츠 경기 정보를 불러오지 못했습니다." });
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
