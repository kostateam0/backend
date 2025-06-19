import { Router } from "express";
import * as leaderBoardController from "../../controllers/lol/leaderBoardController";

const router = Router();

router.get("/", leaderBoardController.getLeaderBoard);

export default router;
