import express from "express";
import {
  addRecipe,
  getUserRecipes,
  getRecipe,
  editRecipe,
  getFamilyRecipes,
  getRecipesFromUserFamilies,
  deleteRecipe,
} from "../controllers/recipeControllers.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  recipeOwner,
  recipeFamilyAuthorized,
} from "../middleware/recipeMiddleware.js";
import { familyAdmin, familyUser } from "../middleware/familyMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", protect, upload.single("image"), addRecipe);
router.get("/userRecipes", protect, getUserRecipes);
router.get("/:recipe_id", protect, recipeFamilyAuthorized, getRecipe);
router.put(
  "/edit/:recipe_id",
  protect,
  recipeOwner,
  upload.single("image"),
  editRecipe
);
router.get("/familyRecipes/:family_id", protect, familyUser, getFamilyRecipes);
router.get("/familyRecipes", protect, getRecipesFromUserFamilies);
router.delete("/:recipe_id", protect, recipeOwner, deleteRecipe);

export default router;
