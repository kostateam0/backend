// src/routes/lol/esportsRoute.ts
import express from "express";
import {
  getUpcomingMatches,
  getPastMatches,     // ✅ 추가
  getLCKRankings,
  getTeamsBySeries,
  getGameResults,
  getEsportsRoster,
} from "../../controllers/lol/esportsController";

const router = express.Router();

// 경기 일정 조회
router.get("/upcoming", getUpcomingMatches); // /api/esports/upcoming
// 과거 경기 조회
router.get("/past",     getPastMatches);      // /api/esports/past 
// 시리즈별 팀/로스터 조회 (seriesId 쿼리 파라미터 필요)
router.get("/teams", getTeamsBySeries); // /api/esports/teams?seriesId=9164
// LCK 순위표 조회
router.get("/LCKRankings", getLCKRankings); // /api/esports/LCKRankings
// 최근 경기 결과 조회
router.get("/gameResults", getGameResults); // /api/esports/gameResults

// 팀 로스터 DB 조회
router.get("/roster", getEsportsRoster); // /api/esports/roster?league=LCK&season=2025 Spring

export default router;
