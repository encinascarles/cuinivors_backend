import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Auth user & get token
// @route   POST /api/recipes
// @access  Private
const addRecipe = asyncHandler(async (req, res) => {
  const { name, provenance, recomendations } = req.body;

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
    user_id: req.user._id,
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
// @route   GET /api/recipes/userRecipes/
// @access  Private
const getUserRecipes = asyncHandler(async (req, res) => {
  if (req.user) {
    const recipes = await Recipe.find({ user_id: req.user._id });

    const recipesToSend = recipes.map((recipe) => {
      return {
        _id: recipe._id,
        name: recipe.name,
        image: recipe.image,
      };
    });
    res.json(recipesToSend);
  } else {
    res.status(400);
    throw new Error("Invalid query parameters");
  }
});

// @desc    Get single recipe provided the recipe id
// @route   GET /api/recipes/:recipe_id
// @access  Private
const getRecipe = asyncHandler(async (req, res) => {
  const { recipe_id } = req.params;
  const recipes = await Recipe.find({
    user_id: req.user._id,
    _id: recipe_id,
  }).select("-user_id");
  if (recipes.length === 0) {
    res.status(404);
  } else {
    const recipeToSend = recipes[0];
    res.json(recipeToSend);
  }
});

// @desc    Edit a recipe
// @route   PUT /api/recipes/
// @access  Private
const editRecipe = asyncHandler(async (req, res) => {
  const { name, provenance, recomendations } = req.body;

  const prepTime = Number(req.body.prepTime);
  const totalTime = Number(req.body.totalTime);
  const ingredients = JSON.parse(req.body.ingredients);
  const steps = JSON.parse(req.body.steps);

  const newRecipeData = {
    name,
    provenance,
    recomendations,
    prepTime,
    totalTime,
    ingredients,
    steps,
  };

  if (req.file) {
    let imageUrl = "";
    try {
      imageUrl = await uploadFileToBlob(req.file);
      newRecipeData.image = imageUrl;
    } catch (error) {
      res.status(500).send("Error uploading image.");
      return;
    }
  }

  const { recipe_id } = req.params;

  const recipe = await Recipe.findOneAndUpdate(
    { _id: recipe_id, user_id: req.user._id },
    newRecipeData,
    { new: true }
  );
  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }
  res.json(recipe);
});

export { addRecipe, getUserRecipes, getRecipe, editRecipe };
