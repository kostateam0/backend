/*  src/controllers/lol/betController.ts  */
import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ────────────────────────── 1. 베팅 제출 ────────────────────────── */
export const submitBet: RequestHandler = async (req, res, next) => {
  try {
    const matchId = Number(req.body.matchId);
    const team    = req.body.team as "blue" | "red";
    const amount  = Number(req.body.amount);
    const userId  = (req.user as any)?.id as string | undefined;

    if (!matchId || !["blue", "red"].includes(team) || !amount || !userId) {
      res.status(400).json({ message: "요청값이 잘못되었습니다." }); return;
    }

    const match = await prisma.match.findUnique({ where: { matchId } });
    if (!match)               { res.status(404).json({ message: "경기를 찾을 수 없습니다." }); return; }
    if (match.settled)        { res.status(400).json({ message: "이미 정산된 경기입니다." }); return; }
    if (new Date() >= match.startTime) {
      res.status(400).json({ message: "경기 시작 이후에는 베팅할 수 없습니다." }); return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.point < amount) {
      res.status(400).json({ message: "포인트 부족 또는 유저 없음" }); return;
    }

    const dup = await prisma.bet.findFirst({ where: { matchId, userId } });
    if (dup) { res.status(400).json({ message: "이미 베팅한 경기입니다." }); return; }

    await prisma.$transaction([
      prisma.bet.create({ data: { matchId, team, amount, userId } }),
      prisma.user.update({ where: { id: userId }, data: { point: { decrement: amount } } }),
    ]);

    res.status(200).json({ message: "✅ 베팅 완료 및 포인트 차감" }); return;
  } catch (err) { next(err); }
};

/* ──────────────────────── 2. 베팅 통계 조회 ──────────────────────── */
export const getBetStats: RequestHandler = async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);
    if (!matchId) { res.status(400).json({ message: "matchId가 필요합니다." }); return; }

    const bets  = await prisma.bet.findMany({ where: { matchId } });
    const stats = bets.reduce(
      (acc, b) => {
        if (b.team === "blue") acc.blue += b.amount;
        else if (b.team === "red") acc.red += b.amount;
        return acc;
      },
      { blue: 0, red: 0 }
    );
    res.status(200).json(stats); return;
  } catch (err) {
    console.error("❌ 통계 조회 실패:", err);
    res.status(500).json({ message: "서버 오류: 통계 조회 실패" }); return;
  }
};

/* ───────────────────────── 3. 경기 정산 ───────────────────────── */
// export const settleMatch: RequestHandler = async (req, res) => {
//   try {
//     const matchId = Number(req.params.matchId);
//     if (!matchId) { res.status(400).json({ message: "matchId가 필요합니다." }); return; }

//     const match = await prisma.match.findUnique({ where: { matchId } });
//     if (!match)               { res.status(404).json({ message: "경기를 찾을 수 없습니다." }); return; }
//     if (match.settled)        { res.status(400).json({ message: "이미 정산된 경기입니다." }); return; }
//     if (!["blue", "red"].includes(match.result ?? "")) {
//       res.status(400).json({ message: "result가 설정되지 않았습니다." }); return;
//     }

//     /* ① 전체 베팅 로드 */
//     const bets     = await prisma.bet.findMany({ where: { matchId } });
//     const winners  = bets.filter(b => b.team === match.result);
//     const losers   = bets.filter(b => b.team !== match.result);

//     const losePool = losers.reduce((s, b) => s + b.amount, 0);

//     /* ② 보너스 계산: 패자 풀을 승자 수로 균등 분배 */
//     const bonusPerWinner = winners.length ? Math.floor(losePool / winners.length) : 0;
//     let   remainder      = winners.length ? losePool % winners.length : 0;

//     /* ③ 승자 원금+보너스 지급 */
//     const updateOps = winners.map((bet, idx) => {
//       const extra = remainder > 0 ? 1 : 0;  // remainder를 앞에서부터 +1
//       if (remainder > 0) remainder -= 1;

//       const increment = bet.amount + bonusPerWinner + extra; // 원금+보너스
//       return prisma.user.update({
//         where: { id: bet.userId },
//         data:  { point: { increment } },
//       });
//     });

//     /* ④ 트랜잭션 실행 */
//     await prisma.$transaction([
//       ...updateOps,
//       prisma.match.update({ where: { matchId }, data: { settled: true } }),
//     ]);

//     res.status(200).json({
//       message: "✅ 정산 완료",
//       winners: winners.length,
//       bonusPerWinner,
//       remainderDistributed: losers.length ? losePool % winners.length : 0,
//     });
//     return;
//   } catch (err) {
//     console.error("❌ 정산 실패:", err);
//     res.status(500).json({ message: "서버 오류: 정산 실패" }); return;
//   }
// };
