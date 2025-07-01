// src/services/lol/fetchLCKRankings.ts

export const fetchLCKRankings = async () => {
  const API_KEY = process.env.PANDA_API_KEY;
  const SERIES_ID = 9164;
  const TOURNAMENT_ID = 16306;

  let page = 1;
  let allMatches: any[] = [];

  while (true) {
    const res = await fetch(
      `https://api.pandascore.co/series/${SERIES_ID}/matches?page[size]=50&page[number]=${page}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );
    if (!res.ok) throw new Error('PandaScore API 호출 실패');
    const matches = await res.json();
    if (!Array.isArray(matches) || matches.length === 0) break;
    allMatches = allMatches.concat(matches);
    page++;
  }

  // 순위 계산
  const standings: Record<string, any> = {};
  for (const match of allMatches) {
    if (
      match.tournament?.id !== TOURNAMENT_ID ||
      match.status !== 'finished' ||
      !match.winner
    ) continue;
    const isTiebreakerMatch =
      (match.name && match.name.toLowerCase().includes('tiebreaker')) ||
      match.opponents.some((opp: any) =>
        opp.opponent.name?.toLowerCase().includes('tiebreaker'),
      );
    if (isTiebreakerMatch) continue;
    const winnerId = match.winner.id;
    let setScores: Record<string, { setWin: number; setLose: number }> = {};
    if (Array.isArray(match.games)) {
      for (const game of match.games) {
        if (!game.winner) continue;
        const winnerTeamId = game.winner.id;
        for (const opp of match.opponents) {
          const teamId = opp.opponent.id;
          if (!setScores[teamId]) setScores[teamId] = { setWin: 0, setLose: 0 };
          if (teamId === winnerTeamId) setScores[teamId].setWin++;
          else setScores[teamId].setLose++;
        }
      }
    }
    for (const opp of match.opponents) {
      const team = opp.opponent;
      const teamId = team.id;
      if (!standings[teamId]) {
        standings[teamId] = {
          name: team.name,
          wins: 0,
          losses: 0,
          setWin: 0,
          setLose: 0,
        };
      }
      if (teamId === winnerId) standings[teamId].wins++;
      else standings[teamId].losses++;
      if (setScores[teamId]) {
        standings[teamId].setWin += setScores[teamId].setWin;
        standings[teamId].setLose += setScores[teamId].setLose;
      }
    }
  }

  const result = Object.values(standings).map((team: any) => {
    const total = team.wins + team.losses;
    const winRate = total > 0 ? team.wins / total : 0;
    const setDiff = team.setWin - team.setLose;
    return {
      ...team,
      winRate: (winRate * 100).toFixed(1) + '%',
      setDiff,
    };
  });

  return result
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        parseFloat(b.winRate) - parseFloat(a.winRate) ||
        b.setDiff - a.setDiff ||
        a.losses - b.losses,
    )
    .map((team, index) => ({ ...team, rank: index + 1 }));
};
