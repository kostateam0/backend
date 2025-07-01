import { Request, Response } from "express";
import { fetchUpcomingMatches } from "../../services/lol/fetchUpcomingMatches";
import { fetchTeamsBySeries } from "../../services/lol/fetchTeamsBySeries";
import { fetchLCKRankings } from "../../services/lol/fetchLCKRankings";

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

export const getLCKRankings = async (req: Request, res: Response) => {
  try {
    const teams = await fetchLCKRankings();
    res.json(teams);
  } catch (error) {
    console.error("LCK 팀 순위 조회 실패:", error);
    res.status(500).json({ message: "LCK 팀 순위를 불러오지 못했습니다." });
  }
};
