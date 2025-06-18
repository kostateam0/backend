import { Request, Response } from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const getMatchDetail = async (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    const result = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY as string },
      }
    );
    if (!result.ok) throw new Error("match detail API 호출 실패");

    const data = await result.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
