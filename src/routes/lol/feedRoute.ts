import { Router } from "express";

const router = Router();

import {
  getFeedAll,
  getFeed,
  createFeed,
  updateFeed,
  deleteFeed,
} from "../../controllers/lol/feedController";

router.get("/", getFeedAll);
router.post("/", createFeed);
router.get("/:id", getFeed);
router.put("/:id", updateFeed);
router.delete("/:id", deleteFeed);

export default router;
