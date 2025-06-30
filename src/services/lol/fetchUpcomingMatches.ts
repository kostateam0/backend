// src/services/esports/esportsService.ts

export const fetchUpcomingMatches = async () => {
    const PANDA_API_KEY = process.env.PANDA_API_KEY;
    const response = await fetch("https://api.pandascore.co/lol/matches/upcoming", {
      headers: {
        Authorization: `Bearer ${PANDA_API_KEY}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`PandaScore API 호출 실패: ${response.status}`);
    }
  
    const data = await response.json();
  
    return data.map((match: any) => ({
      matchId: match.id,
      name: `${match.opponents[0]?.opponent?.name || "팀1"} vs ${match.opponents[1]?.opponent?.name || "팀2"}`,
      league: match.league?.name,
      blueTeam: match.opponents[0]?.opponent?.name,
      redTeam: match.opponents[1]?.opponent?.name,
      blueTeamImage: match.opponents[0]?.opponent?.image_url,
      redTeamImage: match.opponents[1]?.opponent?.image_url,
      startTime: match.begin_at,
    }));
  };
  