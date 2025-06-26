import express from "express";
import {
  getSummonerInfo,
  getSummonerStats,
  getMatchList,
  getChampionStats,
  getSeasonHistory,
  getSummonerChampMastery,
  getSummonerRankTier,
} from "../../controllers/lol/summonerController";

const router = express.Router();

/**
 * @swagger
 * /api/summoner:
 *   get:
 *     summary: 소환사 정보 조회
 *     description: gameName, tag, region을 쿼리로 받아 소환사 정보를 반환합니다.
 *     parameters:
 *       - in: query
 *         name: summonerName
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 소환사 정보 및 최근 매치
 */
router.get("/", async (req, res, next) => {
  try {
    await getSummonerInfo(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/summoner/{puuid}/stats:
 *   get:
 *     summary: 소환사 전적 통계 조회
 *     description: 평균 KDA, 승률 등을 계산하여 반환합니다.
 *     parameters:
 *       - in: path
 *         name: puuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 통계 데이터 반환
 */
router.get("/:puuid/stats", getSummonerStats);

/**
 * @swagger
 * /api/summoner/{puuid}/matches:
 *   get:
 *     summary: 소환사의 최근 매치 ID 목록 조회
 *     description: Riot API에서 최근 매치 ID들을 가져옵니다.
 *     parameters:
 *       - in: path
 *         name: puuid
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: matchId 배열 반환
 */
router.get("/:puuid/matches", getMatchList);

/**
 * @swagger
 * /api/summoner/{puuid}/champion-stats:
 *   get:
 *     summary: 소환사의 챔피언별 전적 통계
 *     description: 자주 플레이한 챔피언의 승률, KDA 등의 통계를 제공합니다.
 *     parameters:
 *       - in: path
 *         name: puuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 챔피언별 통계 목록
 */
router.get("/:puuid/champion-stats", getChampionStats);

/**
 * @swagger
 * /api/summoner/{puuid}/season-history:
 *   get:
 *     summary: 소환사의 시즌별 티어 히스토리 조회
 *     description: 시즌별 랭크 티어 데이터를 제공합니다.
 *     parameters:
 *       - in: path
 *         name: puuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 시즌별 티어 배열 반환
 */
router.get("/:puuid/season-history", getSeasonHistory);

router.get("/:puuid/masteries", getSummonerChampMastery);

router.get("/:puuid/summonerRank", getSummonerRankTier);

export default router;
