import express from "express";
import { getSummonerInfo } from "../../controllers/lol/summonerController";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    await getSummonerInfo(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
