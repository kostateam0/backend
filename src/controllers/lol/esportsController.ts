import { Request, Response } from "express";
import { fetchUpcomingMatches } from "../../services/lol/fetchUpcomingMatches";

export const getUpcomingMatches = async (req: Request, res: Response) => {
  try {
    const matches = await fetchUpcomingMatches();
    res.status(200).json(matches);
  } catch (error) {
    console.error("다가올 e스포츠 경기 조회 실패:", error);
    res.status(500).json({ message: "e스포츠 경기 정보를 불러오지 못했습니다." });
  }
};
