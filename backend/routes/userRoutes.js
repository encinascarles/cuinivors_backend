import express from "express";
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  getUserProfileById,
  getUserFamilies,
  getUserRecipes,
  updateUserProfile,
  deleteUser,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.get("/profile/:user_id", getUserProfileById);
router.get("/families", protect, getUserFamilies);
router.get("/recipes", protect, getUserRecipes);
router.delete("/", protect, deleteUser);

export default router;
