import express from "express";
import {
  getUpcomingMatches,
  getLCKRankings,
  getTeamsBySeries,
} from "../../controllers/lol/esportsController";

const router = express.Router();

// 경기 일정 조회
router.get("/upcoming", getUpcomingMatches); // /api/esports/upcoming
// 시리즈별 팀/로스터 조회 (seriesId 쿼리 파라미터 필요)
router.get("/teams", getTeamsBySeries); // /api/esports/teams?seriesId=9164
// LCK 순위표 조회
router.get("/LCKRankings", getLCKRankings); // /api/esports/LCKRankings

export default router;
