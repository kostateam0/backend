import { Router } from "express";
import * as feedController from "../../controllers/lol/feedController";

const router = Router();

router.get("/", feedController.getFeedAll);
router.get("/:feedID", feedController.getFeed);
router.post("/", feedController.createFeed);
router.put("/:feedID", feedController.updateFeed);
router.delete("/:feedID", feedController.deleteFeed);

export default router;
