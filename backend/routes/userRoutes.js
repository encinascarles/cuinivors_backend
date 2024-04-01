import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  deleteUser,
  acceptInvite,
  declineInvite,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { recipeFamilyAuthorized } from "../middleware/recipeMiddleware.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post(
  "/favorites/add/:recipe_id",
  protect,
  recipeFamilyAuthorized,
  addFavorite
);
router.post(
  "/favorites/remove/:recipe_id",
  protect,
  recipeFamilyAuthorized,
  removeFavorite
);
router.delete("/", protect, deleteUser);
router.post("/invites/accept/:invite_id", protect, acceptInvite);
router.post("/invites/decline/:invite_id", protect, declineInvite);

export default router;
