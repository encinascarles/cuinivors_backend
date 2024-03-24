import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";


// @desc    Auth user & get token
// @route   POST /api/recipes
// @access  Public
const addRecipe = asyncHandler(async (req, res) => {
  const {
    user_id,
    name,
    prepTime,
    totalTime,
    ingredients,
    steps,
    recomendations,
    provenance,
  } = req.body;
  const recipe = await Recipe.create({
    user_id,
    name,
    prepTime,
    totalTime,
    ingredients,
    steps,
    recomendations,
    provenance,
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
    });
  } else {
    res.status(400);
    throw new Error("Invalid recipe data");
  }
});

export { addRecipe };
