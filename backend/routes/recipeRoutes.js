import express from "express";
import {
  addRecipe,
} from "../controllers/recipeControllers.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", upload.single("image"), addRecipe);

export default router;
