// src/services/esports/fetchPastMatches.ts
export const fetchPastMatches = async (limit = 30) => {
    const PANDA_API_KEY = process.env.PANDA_API_KEY;
  
    // 최근 종료 경기 N건 요청
    const res = await fetch(
      `https://api.pandascore.co/lol/matches/past?per_page=${limit}`,
      {
        headers: { Authorization: `Bearer ${PANDA_API_KEY}` },
      }
    );
  
    if (!res.ok) throw new Error(`PandaScore API 호출 실패: ${res.status}`);
  
    const data = await res.json();
  
    return data.map((m: any) => ({
      matchId: m.id,
      name: `${m.opponents[0]?.opponent?.name ?? "팀1"} vs ${
        m.opponents[1]?.opponent?.name ?? "팀2"
      }`,
      league: m.league?.name,
      blueTeam: m.opponents[0]?.opponent?.name,
      redTeam: m.opponents[1]?.opponent?.name,
      blueTeamImage: m.opponents[0]?.opponent?.image_url,
      redTeamImage: m.opponents[1]?.opponent?.image_url,
      winner: m.winner?.name ?? null,
      startTime: m.begin_at,
      endTime: m.end_at,
    }));
  };
  