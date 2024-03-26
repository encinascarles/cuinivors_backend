import express from "express";
import {
  addRecipe,
  getRecipe,
  getUserRecipes,
} from "../controllers/recipeControllers.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", protect, upload.single("image"), addRecipe);
router.get("/userRecipes", protect, getUserRecipes);
router.get("/:recipe_id", protect, getRecipe);

export default router;
