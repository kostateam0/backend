// src/routes/lol/esportsRoute.ts
import express from "express";
import {
  getUpcomingMatches,
  getPastMatches,     // ✅ 추가
  getLCKRankings,
  getTeamsBySeries,
  getGameResults,
} from "../../controllers/lol/esportsController";

const router = express.Router();

// 🏆 경기 일정
router.get("/upcoming", getUpcomingMatches);  // /api/esports/upcoming
router.get("/past",     getPastMatches);      // /api/esports/past  ✅

// 🏟️ 팀 / 로스터
router.get("/teams", getTeamsBySeries);       // /api/esports/teams?seriesId=9164

// 📊 순위표 & 결과
router.get("/LCKRankings", getLCKRankings);   // /api/esports/LCKRankings
router.get("/gameResults", getGameResults);   // /api/esports/gameResults

export default router;
