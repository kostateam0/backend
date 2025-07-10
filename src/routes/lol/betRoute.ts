import express from "express";
import {
  submitBet,
  getBetStats,
//   setMatchResult,
  // settleMatch,
} from "../../controllers/lol/betController";

const router = express.Router();

router.post("/", submitBet);                         // 베팅 제출
router.get("/stats/:matchId", getBetStats);          // 통계 조회
// router.post("/result", setMatchResult);              // 경기 결과 설정 (관리자)
// router.post("/settle/:matchId", settleMatch);        // 정산 실행

export default router;
