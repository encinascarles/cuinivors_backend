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
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validationMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const recipeIdValidation = [param("recipe_id").isMongoId()];
const recipeCreateValidation = [
  body("name").not().isEmpty(),
  body("prep_time").isInt({ min: 0 }),
  body("total_time").isInt({ min: 0 }),
  body("ingredients")
    .not()
    .isEmpty()
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        return false;
      }
    }),
  body("steps")
    .not()
    .isEmpty()
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        return false;
      }
    }),
  body("recommendations").optional(),
  body("origin").optional(),
  body("visibility").optional().isIn(["public", "private", "family"]),
];
const recipeEditValidation = [
  body("name").optional().not().isEmpty(),
  body("prep_time").optional().isInt({ min: 0 }),
  body("total_time").optional().isInt({ min: 0 }),
  body("ingredients")
    .optional()
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        return false;
      }
    }),
  body("steps")
    .optional()
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        return false;
      }
    }),
  body("recommendations").optional(),
  body("origin").optional(),
  body("visibility").optional().isIn(["public", "private", "family"]),
];

const router = express.Router();

router.post(
  "/",
  protect,
  recipeCreateValidation,
  validateRequest,
  upload.single("recipe_image"),
  addRecipe
);
router.get("/public", getPublicRecipes);
router.get(
  "/:recipe_id",
  recipeIdValidation,
  validateRequest,
  protect,
  recipeAuthorized,
  getRecipe
);
router.put(
  "/:recipe_id",
  protect,
  recipeIdValidation,
  recipeEditValidation,
  validateRequest,
  recipeOwner,
  upload.single("recipe_image"),
  editRecipe
);
router.put(
  "/:recipe_id/favorite",
  protect,
  recipeIdValidation,
  validateRequest,
  recipeAuthorized,
  addFavorite
);
router.delete(
  "/:recipe_id/favorite",
  protect,
  recipeIdValidation,
  validateRequest,
  recipeAuthorized,
  removeFavorite
);
router.delete(
  "/:recipe_id",
  protect,
  recipeIdValidation,
  validateRequest,
  recipeOwner,
  deleteRecipe
);

export default router;
