import express from "express";
import {
  createInvite,
  listInvites,
  acceptInvite,
  declineInvite,
} from "../controllers/inviteControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validationMiddleware.js";

const inviteIdValidation = [param("invite_id").isMongoId()];
const inviteCreateValidation = [
  body("invited_username").isString(),
  body("family_id").isMongoId(),
];

const router = express.Router();

router.post(
  "/",
  protect,
  inviteCreateValidation,
  validateRequest,
  createInvite
);
router.get("/", protect, listInvites);
router.post(
  "/:invite_id/accept",
  protect,
  inviteIdValidation,
  validateRequest,
  acceptInvite
);
router.post(
  "/:invite_id/decline",
  protect,
  inviteIdValidation,
  validateRequest,
  declineInvite
);

export default router;
