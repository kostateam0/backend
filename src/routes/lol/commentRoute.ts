import { Router } from "express";
import * as commentController from "../../controllers/lol/commentController";

const router = Router();

router.get("/:feedID", commentController.getComment);
router.post("/:feedID", commentController.createComment);
// router.put("/:feedID", commentController.updateComment);
// router.delete("/:feedID", commentController.deleteComment);

export default router;
