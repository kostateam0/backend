import { Router } from "express";
import * as feedController from "../../controllers/lol/feedController";
import { upload } from "../../controllers/lol/feedController"; // 추가

const router = Router();

router.get("/", feedController.getFeeds);
router.get("/:feedID", feedController.getFeed);
router.post("/", upload.array("images", 5), feedController.createFeed); // ✅ 수정됨
router.put("/:feedID", feedController.updateFeed);
router.delete("/:feedID", feedController.deleteFeed);

router.post("/:feedID/like", feedController.toggleFeedLike);
router.get("/:feedID/likes", feedController.getFeedLikes);
router.get("/:feedID/isLiked", feedController.isFeedLiked);

export default router;
