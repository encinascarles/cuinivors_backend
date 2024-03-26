import express from "express";
import {
  addRecipe,
  editRecipe,
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
router.put("/edit/:recipe_id", protect, upload.single("image"), editRecipe);

export default router;
