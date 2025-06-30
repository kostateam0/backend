// src/controllers/lol/betController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/bet
 * - 베팅 제출: matchId, team, amount 필요
 */
export const submitBet = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.body.matchId);
    const team = req.body.team;
    const amount = Number(req.body.amount);
    const userId = (req.user as any)?.id;

    // 유효성 검사
    if (!matchId || !["blue", "red"].includes(team) || !amount || !userId) {
      res.status(400).json({ message: "요청값이 잘못되었습니다." });
      return;
    }

    // 유저 포인트 확인
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.point < amount) {
      res.status(400).json({ message: "포인트 부족 또는 유저 없음" });
      return;
    }

    // 중복 베팅 확인
    const existingBet = await prisma.bet.findFirst({
      where: { matchId, userId },
    });
    if (existingBet) {
      res.status(400).json({ message: "이미 베팅한 경기입니다." });
      return;
    }

    // 트랜잭션으로 베팅 저장 및 포인트 차감
    await prisma.$transaction([
      prisma.bet.create({
        data: {
          matchId,
          team,
          amount,
          userId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          point: { decrement: amount },
        },
      }),
    ]);

    res.status(200).json({ message: "✅ 베팅 완료 및 포인트 차감" });
  } catch (err) {
    console.error("❌ 베팅 실패:", err);
    res.status(500).json({ message: "서버 오류: 베팅 실패" });
  }
};

/**
 * GET /api/bet/:matchId
 * - 특정 matchId에 대한 베팅 통계 반환
 */
export const getBetStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);

    if (!matchId) {
      res.status(400).json({ message: "matchId가 필요합니다." });
      return;
    }

    const allBets = await prisma.bet.findMany({ where: { matchId } });

    const stats = allBets.reduce(
      (acc: { blue: number; red: number }, bet) => {
        if (bet.team === "blue") acc.blue += bet.amount;
        if (bet.team === "red") acc.red += bet.amount;
        return acc;
      },
      { blue: 0, red: 0 }
    );

    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ 통계 조회 실패:", err);
    res.status(500).json({ message: "서버 오류: 통계 조회 실패" });
  }
};
