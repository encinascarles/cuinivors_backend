import express from "express";
import {
  addRecipe,
  uploadRecipeImage,
} from "../controllers/recipeControllers.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", upload.single("image"), addRecipe);

router.post("/upload-image", upload.single("image"), uploadRecipeImage);

export default router;
