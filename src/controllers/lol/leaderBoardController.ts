import { RequestHandler } from "express";
import prisma from "../../lib/prisma"; // 경로는 프로젝트에 맞게 조정
/**
 *  DB에 저장된 리더보드 정보를 조회하는 핸들러
 *  @route GET /api/lol/leaderboard/load
 */
export const getLeaderBoard: RequestHandler = async (req, res) => {
  try {
    const leaderboard = await prisma.rank.findMany({
      orderBy: {
        leaguePoints: "desc",
      },
      // resquest에 따라 limit, offset 등을 추가할 수 있음
      include: {
        profile: true, // puuid 기준으로 profile 테이블 조인
      },
    });

    // 필요한 데이터만 가공해서 전달
    const data = leaderboard.map((rank) => ({
      puuid: rank.puuid,
      leaguePoints: rank.leaguePoints,
      rank: rank.rank,
      wins: rank.wins,
      losses: rank.losses,
      veteran: rank.veteran,
      inactive: rank.inactive,
      freshBlood: rank.freshBlood,
      hotStreak: rank.hotStreak,
      summonerName: rank.profile?.summonerName || null,
      summonerLevel: rank.profile?.summonerLevel || null,
      profileIconId: rank.profile?.profileIconId || null,
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error("리더보드 조회 중 오류 발생:", error);
    res.status(500).json({ error: "리더보드 조회 중 오류 발생" });
  }
};

/**
 *  리더보드 정보를 Riot API에서 가져와 DB에 저장하는 핸들러
 *  @route GET /api/lol/leaderboard/save
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const saveLeaderBoard: RequestHandler = async (req, res) => {
  if (!process.env.API_KEY) {
    console.error("API_KEY 환경 변수가 설정되지 않았습니다.");
    res.status(500).json({ error: "서버 환경 변수 오류" });
  }

  try {
    const response = await fetch(
      `https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`,
      {
        headers: { "X-Riot-Token": process.env.API_KEY || "" },
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `API 호출 실패: ${err.status?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const entries = data.entries;
    console.log(`챌린저 수: ${entries.length}`);

    let count = 0;
    for (const entry of entries) {
      // 랭킹 정보 저장
      await prisma.rank.upsert({
        where: { puuid: entry.puuid },
        update: {
          leaguePoints: entry.leaguePoints,
          rank: entry.rank,
          wins: entry.wins,
          losses: entry.losses,
          veteran: entry.veteran,
          inactive: entry.inactive,
          freshBlood: entry.freshBlood,
          hotStreak: entry.hotStreak,
        },
        create: {
          puuid: entry.puuid,
          leaguePoints: entry.leaguePoints,
          rank: entry.rank,
          wins: entry.wins,
          losses: entry.losses,
          veteran: entry.veteran,
          inactive: entry.inactive,
          freshBlood: entry.freshBlood,
          hotStreak: entry.hotStreak,
        },
      });

      // 유저 정보 저장 (레이트 리밋 고려)
      try {
        // 1. 소환사 이미지 및 레벨 관련 정보

        // {
        //   "puuid": "e8FaLfQtQbfOdFY3kIpS4TLUFT8TFDgOSwdz1QUVFPeJeXBuhS9lp0bt32MtjE38J2jJnXJomclErQ",
        //   "profileIconId": 6592,
        //   "revisionDate": 1752597550796,
        //   "summonerLevel": 896
        // }
        const summonerRes = await fetch(
          `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${entry.puuid}`,
          {
            headers: { "X-Riot-Token": process.env.API_KEY || "" },
          }
        );

        // 2. Riot ID 기반 게임 닉네임
        //         {
        //   "puuid": "e8FaLfQtQbfOdFY3kIpS4TLUFT8TFDgOSwdz1QUVFPeJeXBuhS9lp0bt32MtjE38J2jJnXJomclErQ",
        //   "gameName": "DK Sharvel",
        //   "tagLine": "KR1"
        // }
        const accountRes = await fetch(
          `https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${entry.puuid}`,
          {
            headers: { "X-Riot-Token": process.env.API_KEY || "" },
          }
        );

        if (summonerRes.ok && accountRes.ok) {
          const summonerData = await summonerRes.json();
          console.log(summonerData);
          const accountData = await accountRes.json();
          console.log(accountData);

          await prisma.profile.upsert({
            where: { puuid: entry.puuid },
            update: {
              summonerName: accountData.gameName,
              profileIconId: summonerData.profileIconId,
              summonerLevel: summonerData.summonerLevel,
              revisionDate: summonerData.revisionDate,
            },
            create: {
              summonerName: accountData.gameName,
              puuid: entry.puuid,
              profileIconId: summonerData.profileIconId,
              revisionDate: summonerData.revisionDate,
              summonerLevel: summonerData.summonerLevel,
            },
          });
        } else {
          console.warn(`유저 정보 API 실패: ${entry.puuid}`);
        }
      } catch (err) {
        console.error(`유저 정보 저장 오류: ${entry.puuid}`, err);
      }

      if (count === 2) return;
      // count++;
      if (count % 95 === 0) {
        console.log("레이트 리밋 대기중... (120초)");
        await delay(120_000); // 2분 대기
      } else {
        await delay(1300); // 1.3초 간격 (100회/2분 안전 마진)
      }
    }

    res.status(200).json({ message: "DB 저장 완료", count: entries.length });
  } catch (error) {
    console.error("리더보드 저장 중 오류 발생:", error);
    res.status(500).json({ error: "리더보드 저장 중 오류 발생" });
  }
};
