import dotenv from "dotenv";
import fetch from "node-fetch"; // node 환경에서 fetch 사용 시 필요
import { Request, Response } from "express";
dotenv.config();

export const getSummonerInfo = async (req: Request, res: Response) => {
  if (!process.env.API_KEY) {
    console.error("API_KEY 환경 변수가 설정되지 않았습니다.");
    return res.status(500).json({ error: "서버 환경 변수 오류" });
  }

  const { summonerName, tag, region } = req.query as {
    summonerName: string;
    tag: string;
    region: string;
  };
  if (!summonerName || !tag) {
    return res.status(400).json({ error: "summonerName과 tag이 필요합니다." });
  }

  // region 값을 받아서 해당 region의 API 도메인을 반환하는 함수 (TypeScript)
  function getAccountApiDomain(region: string): string {
    const accountRegionMap: { [key: string]: string } = {
      kr: "asia",
      jp1: "asia",
      eun1: "europe",
      euw1: "europe",
      tr1: "europe",
      ru: "europe",
      na1: "americas",
      br1: "americas",
      la1: "americas",
      la2: "americas",
      oc1: "americas",
    };
    return accountRegionMap[region] || "asia";
  }

  try {
    // region에 맞는 도메인 사용
    const accountApiDomain = getAccountApiDomain(region);
    console.log(`accountApiDomain: ${accountApiDomain}`);

    // account-v1로 puuid 얻기
    const accountRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
        summonerName
      )}/${encodeURIComponent(tag)}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!accountRes.ok) throw new Error("account-v1 API 호출 실패");
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;
    console.log(`puuid: ${puuid}`);
    if (!puuid) {
      return res.json({ error: "소환사 정보를 찾을 수 없습니다." });
    }
    console.log(`소환사 이름: ${summonerName}#${tag}`);

    // puuid로 summoner-v4에서 소환사 정보 얻기
    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!summonerRes.ok) throw new Error("summoner-v4 API 호출 실패");
    const data = await summonerRes.json();
    console.log(`소환사 레벨: ${data.summonerLevel}`);
    console.log(`소환사 아이콘 번호: ${data.profileIconId}`);

    // 가장 최근 경기 1개 가져오기
    const matchOneRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!matchOneRes.ok) throw new Error("matchOne API 호출 실패");
    const matchOneData = await matchOneRes.json();
    console.log("matchOne:", matchOneData);
    const matchId = matchOneData[0];

    const matchDetailRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY },
      }
    );
    if (!matchDetailRes.ok) throw new Error("matchDetail API 호출 실패");
    const match = await matchDetailRes.json();
    console.log("matchDetail:", match);

    res.json({ summonerName, tag, user: data, match });
  } catch (error) {
    if (error instanceof Error) {
      console.error("에러:", error.message);
      res.json({ error: error.message });
    } else {
      console.error("에러:", error);
      res.json({ error: String(error) });
    }
  }
};

// src/controllers/lol/summonerController.ts
export const getMatchList = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const start = parseInt(req.query.start as string) || 0;
  const count = parseInt(req.query.count as string) || 10;

  const accountApiDomain = "asia"; // match-v5는 지역 상관없이 asia 기준

  try {
    const matchRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY as string },
      }
    );
    if (!matchRes.ok) throw new Error("match list API 호출 실패");

    const matchIds = await matchRes.json();
    res.json({ puuid, matchIds });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSummonerStats = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const accountApiDomain = "asia";

  try {
    // 최근 10경기 가져오기
    const matchIdsRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers: { "X-Riot-Token": process.env.API_KEY as string } }
    );
    const matchIds = await matchIdsRes.json();

    // 각 경기 상세 가져오기
    const matchResults = await Promise.all(
      matchIds.map((matchId: string) =>
        fetch(
          `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          {
            headers: { "X-Riot-Token": process.env.API_KEY as string },
          }
        ).then((r) => r.json())
      )
    );

    // 통계 계산
    let totalKills = 0,
      totalDeaths = 0,
      totalAssists = 0,
      wins = 0;

    matchResults.forEach((match: any) => {
      const player = match.info.participants.find(
        (p: any) => p.puuid === puuid
      );
      if (player) {
        totalKills += player.kills;
        totalDeaths += player.deaths;
        totalAssists += player.assists;
        if (player.win) wins++;
      }
    });

    const avgKDA = `${(totalKills / matchResults.length).toFixed(1)} / ${(
      totalDeaths / matchResults.length
    ).toFixed(1)} / ${(totalAssists / matchResults.length).toFixed(1)}`;
    const winRate = `${((wins / matchResults.length) * 100).toFixed(1)}%`;

    res.json({ avgKDA, winRate, totalGames: matchResults.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChampionStats = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const accountApiDomain = "asia";

  try {
    const matchIdsRes = await fetch(
      `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
      { headers: { "X-Riot-Token": process.env.API_KEY as string } }
    );
    const matchIds = await matchIdsRes.json();

    const matchResults = await Promise.all(
      matchIds.map((matchId: string) =>
        fetch(
          `https://${accountApiDomain}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          {
            headers: { "X-Riot-Token": process.env.API_KEY as string },
          }
        ).then((r) => r.json())
      )
    );

    const championMap: Record<
      string,
      {
        games: number;
        wins: number;
        kills: number;
        deaths: number;
        assists: number;
      }
    > = {};

    matchResults.forEach((match: any) => {
      const player = match.info.participants.find(
        (p: any) => p.puuid === puuid
      );
      if (!player) return;
      const champ = player.championName;
      if (!championMap[champ]) {
        championMap[champ] = {
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        };
      }
      championMap[champ].games++;
      if (player.win) championMap[champ].wins++;
      championMap[champ].kills += player.kills;
      championMap[champ].deaths += player.deaths;
      championMap[champ].assists += player.assists;
    });

    const result = Object.entries(championMap).map(([championName, stats]) => ({
      championName,
      games: stats.games,
      winRate: `${((stats.wins / stats.games) * 100).toFixed(1)}%`,
      avgKDA: `${(stats.kills / stats.games).toFixed(1)} / ${(
        stats.deaths / stats.games
      ).toFixed(1)} / ${(stats.assists / stats.games).toFixed(1)}`,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSeasonHistory = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const region = "kr";

  try {
    // 먼저 summonerId를 얻기 위해 puuid로 summoner 데이터 호출
    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": process.env.API_KEY as string } }
    );
    const summonerData = await summonerRes.json();

    const leagueRes = await fetch(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,

      { headers: { "X-Riot-Token": process.env.API_KEY as string } }
    );
    const rankData = await leagueRes.json();

    res.json({ tierHistory: rankData }); // 배열 형태로 반환됨
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSummonerChampMastery = async (req: Request, res: Response) => {
  const { puuid } = req.params;
  const region = "kr";

  try {
    const masteryRes = await fetch(
      `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": process.env.API_KEY as string } }
    );
    if (!masteryRes.ok) throw new Error("챔피언 마스터리 API 호출 실패");

    const masteryData = await masteryRes.json();
    res.json(masteryData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
