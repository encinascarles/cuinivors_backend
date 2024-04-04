import express from "express";
import {
  addRecipe,
  getRecipe,
  editRecipe,
  getPublicRecipes,
  addFavorite,
  removeFavorite,
  deleteRecipe,
} from "../controllers/recipeControllers.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  recipeOwner,
  recipeAuthorized,
} from "../middleware/recipeMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", protect, upload.single("image"), addRecipe);
router.get("/public", getPublicRecipes);
router.get("/:recipe_id", protect, recipeAuthorized, getRecipe);
router.put(
  "/:recipe_id",
  protect,
  recipeOwner,
  upload.single("image"),
  editRecipe
);
router.put("/:recipe_id/favorite", protect, recipeAuthorized, addFavorite);
router.delete(
  "/:recipe_id/favorite",
  protect,
  recipeAuthorized,
  removeFavorite
);
router.delete("/:recipe_id", protect, recipeOwner, deleteRecipe);

export default router;
