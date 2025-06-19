import { Router } from "express";
import * as leaderBoardController from "../../controllers/lol/leaderBoardController";

const router = Router();

router.get("/save", leaderBoardController.saveLeaderBoard);
router.get("/load", leaderBoardController.getLeaderBoard);

export default router;
