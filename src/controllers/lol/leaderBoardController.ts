import { RequestHandler } from "express";
import prisma from "../../lib/prisma";

export const getLeaderBoard: RequestHandler = async (req, res) => {
  if (!process.env.API_KEY) {
    console.error("API_KEY 환경 변수가 설정되지 않았습니다.");
    return res.status(500).json({ error: "서버 환경 변수 오류" });
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

    // DB에 저장
    for (const entry of entries) {
      await prisma.rank.upsert({
        where: { summonerId: entry.summonerId },
        update: {
          summonerName: entry.summonerName,
          leaguePoints: entry.leaguePoints,
          rank: entry.rank,
          tier: data.tier, // 챌린저일 경우 항상 "CHALLENGER"
          wins: entry.wins,
          losses: entry.losses,
          veteran: entry.veteran,
          inactive: entry.inactive,
          freshBlood: entry.freshBlood,
          hotStreak: entry.hotStreak,
        },
        create: {
          summonerId: entry.summonerId,
          summonerName: entry.summonerName,
          leaguePoints: entry.leaguePoints,
          rank: entry.rank,
          tier: data.tier,
          wins: entry.wins,
          losses: entry.losses,
          veteran: entry.veteran,
          inactive: entry.inactive,
          freshBlood: entry.freshBlood,
          hotStreak: entry.hotStreak,
        },
      });
    }

    console.log(data);
    res.status(200).json({ message: "DB 저장 완료", count: entries.length });
    // res.status(200).json({ data });
  } catch (error) {
    console.error("리더보드 조회 중 오류 발생:", error);
    res.status(500).json({ error: "리더보드 조회 중 오류 발생" });
  }
};
