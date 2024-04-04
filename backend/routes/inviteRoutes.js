import express from "express";
import {
  createInvite,
  listInvites,
  acceptInvite,
  declineInvite,
} from "../controllers/inviteControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInvite);
router.get("/", protect, listInvites);
router.post("/:invite_id/accept", protect, acceptInvite);
router.post("/:invite_id/decline", protect, declineInvite);

export default router;
