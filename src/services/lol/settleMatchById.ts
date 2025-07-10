// src/services/lol/settleMatchById.ts
import prisma from "../../lib/prisma";

export const settleMatchById = async (matchId: number): Promise<void> => {
  const match = await prisma.match.findUnique({ where: { matchId } });
  if (!match || match.settled || !["blue", "red"].includes(match.result ?? "")) return;

  const bets = await prisma.bet.findMany({ where: { matchId } });
  const winners = bets.filter(b => b.team === match.result);
  const losers = bets.filter(b => b.team !== match.result);
  const losePool = losers.reduce((s, b) => s + b.amount, 0);

  const bonusPerWinner = winners.length ? Math.floor(losePool / winners.length) : 0;
  let remainder = winners.length ? losePool % winners.length : 0;

  const updateOps = winners.map((bet) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    const increment = bet.amount + bonusPerWinner + extra;
    return prisma.user.update({
      where: { id: bet.userId },
      data: { point: { increment } },
    });
  });

  await prisma.$transaction([
    ...updateOps,
    prisma.match.update({ where: { matchId }, data: { settled: true } }),
  ]);

  console.log(`🎯 [자동 정산 완료] ${match.name}`);
};
