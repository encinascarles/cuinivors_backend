import express from "express";
import { addRecipe } from "../controllers/recipeControllers.js";

const router = express.Router();

router.post("/", addRecipe);

export default router;
