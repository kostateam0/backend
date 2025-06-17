import dotenv from "dotenv";
import fetch from "node-fetch"; // node 환경에서 fetch 사용 시 필요
import { Request, Response } from "express";
dotenv.config();

export const getSummonerInfo = async (req: Request, res: Response) => {
  if (!process.env.API_KEY) {
    console.error("API_KEY 환경 변수가 설정되지 않았습니다.");
    return res.status(500).json({ error: "서버 환경 변수 오류" });
  }

  const { gameName, tagLine } = req.query;
  if (!gameName || !tagLine) {
    return res.status(400).json({ error: "gameName과 tagLine이 필요합니다." });
  }

  try {
    // account-v1로 puuid 얻기
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
        String(gameName)
      )}/${encodeURIComponent(String(tagLine))}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!accountRes.ok) {
      const err = await accountRes.json().catch(() => ({}));
      throw new Error(
        `account-v1 API 호출 실패: ${
          err.status?.message || accountRes.statusText
        }`
      );
    }
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;
    if (!puuid) {
      return res.status(404).json({ error: "소환사 정보를 찾을 수 없습니다." });
    }

    // puuid로 summoner-v4에서 소환사 정보 얻기
    const summonerRes = await fetch(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!summonerRes.ok) {
      const err = await summonerRes.json().catch(() => ({}));
      throw new Error(
        `summoner-v4 API 호출 실패: ${
          err.status?.message || summonerRes.statusText
        }`
      );
    }
    const data = await summonerRes.json();

    // 가장 최근 경기 1개 가져오기
    const matchOneRes = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!matchOneRes.ok) {
      const err = await matchOneRes.json().catch(() => ({}));
      throw new Error(
        `matchOne API 호출 실패: ${
          err.status?.message || matchOneRes.statusText
        }`
      );
    }
    const matchOneData = await matchOneRes.json();
    const matchId = matchOneData[0];
    if (!matchId) {
      return res
        .status(404)
        .json({ error: "최근 경기 정보를 찾을 수 없습니다." });
    }

    const matchDetailRes = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!matchDetailRes.ok) {
      const err = await matchDetailRes.json().catch(() => ({}));
      throw new Error(
        `matchDetail API 호출 실패: ${
          err.status?.message || matchDetailRes.statusText
        }`
      );
    }
    const match = await matchDetailRes.json();

    res.json({ gameName, tagLine, user: data, match });
  } catch (error: any) {
    console.error("에러:", error.message);
    res.status(500).json({ error: error.message || "서버 오류" });
  }
};
