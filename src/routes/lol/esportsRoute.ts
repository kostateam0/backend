import express from "express";
import { getUpcomingMatches } from "../../controllers/lol/esportsController";

const router = express.Router();

router.get("/upcoming", getUpcomingMatches); // ✅ /api/esports/upcoming

export default router;
