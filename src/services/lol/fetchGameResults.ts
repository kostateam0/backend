export const fetchGameResults = async () => {
  const PANDA_API_KEY = process.env.PANDA_API_KEY;

  // page[size]=10을 추가해서 10개만 받아오도록 설정
  const res = await fetch(
    `https://api.pandascore.co/lol/matches/past?page[size]=10`,
    {
      headers: {
        Authorization: `Bearer ${PANDA_API_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error("PandaScore API 호출 실패");

  const data = await res.json();
  return data; // 최근 10경기 결과 반환
};
