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

export const getFullMatches = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const count = parseInt(req.query.count as string) || 20;
  const accountApiDomain = "asia";

  try {
    const matchIdsRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY as string },
      }
    );
    if (!matchIdsRes.ok) throw new Error("matchId 가져오기 실패");

    const matchIds = await matchIdsRes.json();
    const matches: any[] = [];

    for (const id of matchIds) {
      try {
        const result = await fetch(
          `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/${id}`,
          {
            headers: { "X-Riot-Token": process.env.API_KEY as string },
          }
        );
        if (!result.ok) {
          matches.push(null); // 순서 유지
          continue;
        }
        const match = await result.json();
        matches.push(match);
      } catch {
        matches.push(null); // 실패한 요청은 null 삽입
      }
    }

    res.json({ puuid, matches });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};