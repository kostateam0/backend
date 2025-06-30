// routes/lol/betRoute.ts
import express from "express";
import { submitBet, getBetStats } from "../../controllers/lol/betController";

const router = express.Router();

router.post("/", submitBet); // POST /api/bet
router.get("/stats/:matchId", getBetStats); // GET /api/bet/stats/:matchId

export default router;
