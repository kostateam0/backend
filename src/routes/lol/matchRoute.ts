import express from "express";
import { getMatchDetail } from "../../controllers/lol/matchController";

const router = express.Router();

/**
 * @swagger
 * /api/match/{matchId}:
 *   get:
 *     summary: 매치 상세 정보 조회
 *     description: matchId를 통해 해당 게임의 전체 매치 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Riot에서 제공하는 match ID
 *     responses:
 *       200:
 *         description: 매치 상세 정보 객체 반환
 */
router.get("/:matchId", getMatchDetail);

export default router;
