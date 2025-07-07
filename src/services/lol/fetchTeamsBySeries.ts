import dotenv from "dotenv";
dotenv.config();

export const fetchTeamsBySeries = async (seriesId: number) => {
  const PANDA_API_KEY = process.env.PANDA_API_KEY;

  const response = await fetch(
    `https://api.pandascore.co/lol/series/${seriesId}/teams`,
    {
      headers: {
        Authorization: `Bearer ${PANDA_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`PandaScore API 호출 실패: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
