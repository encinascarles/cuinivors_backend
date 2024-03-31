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

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post("/favorites/add", protect, addFavorite);
router.post("/favorites/remove", protect, removeFavorite);
router.delete("/", protect, deleteUser);
router.post("/acceptinvite", protect, acceptInvite);
router.post("/declineinvite", protect, declineInvite);

export default router;
