import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Auth user & get token
// @route   POST /api/recipes
// @access  Private
const addRecipe = asyncHandler(async (req, res) => {
  const { user_id, name, provenance, recomendations } = req.body;

  const prepTime = Number(req.body.prepTime);
  const totalTime = Number(req.body.totalTime);
  const ingredients = JSON.parse(req.body.ingredients);
  const steps = JSON.parse(req.body.steps);

  if (!req.file) {
    return res.status(400).send("File not found for upload.");
  }

  let imageUrl = "";

  try {
    imageUrl = await uploadFileToBlob(req.file);
  } catch (error) {
    res.status(500).send("Error uploading image.");
    return;
  }

  const recipe = await Recipe.create({
    user_id,
    name,
    prepTime,
    totalTime,
    ingredients,
    steps,
    recomendations,
    provenance,
    image: imageUrl,
  });

  if (recipe) {
    res.status(201).json({
      _id: recipe._id,
      user_id: recipe.user_id,
      name: recipe.name,
      prepTime: recipe.prepTime,
      totalTime: recipe.totalTime,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      recomendations: recipe.recomendations,
      provenance: recipe.provenance,
      image: recipe.image,
    });
  } else {
    res.status(400);
    throw new Error("Invalid recipe data");
  }
});

// @desc    Get user recipes
// @route   GET /api/recipes
// @access  Private
const getUserRecipes = asyncHandler(async (req, res) => {
  const { user_id } = req.query;
  const recipes = await Recipe.find({ user_id });

  const recipesToSend = recipes.map((recipe) => {
    return {
      _id: recipe._id,
      name: recipe.name,
      image: recipe.image,
    };
  });
  res.json(recipesToSend);
});


export { addRecipe, getUserRecipes };
