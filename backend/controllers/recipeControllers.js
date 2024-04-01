import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Add new recipe
// @route   POST /api/recipes
// @access  Private
const addRecipe = asyncHandler(async (req, res) => {
  // Declare the variables
  let name,
    origin,
    recommendations,
    prep_time,
    total_time,
    ingredients,
    steps,
    is_private;
  // Get the data from the request
  try {
    name = req.body.name;
    origin = req.body.origin;
    recommendations = req.body.recommendations;
    prep_time = Number(req.body.prep_time);
    total_time = Number(req.body.total_time);
    ingredients = JSON.parse(req.body.ingredients);
    steps = JSON.parse(req.body.steps);
    is_private = JSON.parse(req.body.is_private);
  } catch (error) {
    res.status(400);
    throw new Error("Invalid recipe data");
  }
  // Check if the user provided an image
  let imageUrl = "/images/default_recipe.jpg";
  if (req.file) {
    try {
      imageUrl = await uploadFileToBlob(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
    }
  }
  // Create the recipe
  const recipe = await Recipe.create({
    creator_id: req.user._id,
    name,
    prep_time,
    total_time,
    ingredients,
    steps,
    recommendations,
    origin,
    image: imageUrl,
    is_private,
  });
  // Send the recipe data
  if (recipe) {
    res.status(201).json({
      _id: recipe._id,
      name: recipe.name,
      prepTime: recipe.prepTime,
      totalTime: recipe.totalTime,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      recommendations: recipe.recommendations,
      origin: recipe.origin,
      image: recipe.image,
      private: recipe.private,
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
  // Search for recipes created by the user
  const recipes = await Recipe.find({ creator_id: req.user._id });
  // Send only the needed data
  const recipesToSend = recipes.map((recipe) => {
    return {
      _id: recipe._id,
      name: recipe.name,
      image: recipe.image,
    };
  });
  res.json(recipesToSend);
});

// @desc    Get single recipe provided the recipe id
// @route   GET /api/recipes/:recipe_id
// @access  Private, recipeFamilyAuthorized
const getRecipe = asyncHandler(async (req, res) => {
  // Find recipe creator
  const creator = await User.findById(req.recipe.creator_id);
  // Send the recipe data
  res.json({
    _id: req.recipe._id,
    name: req.recipe.name,
    origin: req.recipe.origin,
    recommendations: req.recipe.recommendations,
    prep_time: req.recipe.prep_time,
    total_time: req.recipe.total_time,
    ingredients: req.recipe.ingredients,
    steps: req.recipe.steps,
    is_private: req.recipe.is_private,
    image: req.recipe.image,
    creator_username: creator.username,
  });
});

// @desc    Edit a recipe
// @route   PUT /api/recipes/
// @access  Private, recipeOwner
const editRecipe = asyncHandler(async (req, res) => {
  // Get the data from the request, not everything is necessary
  try {
    const {
      name,
      origin,
      recommendations,
      prep_time,
      total_time,
      ingredients,
      steps,
      is_private,
    } = req.body;
    const recipeData = {
      ...(name && { name }),
      ...(origin && { origin }),
      ...(recommendations && { recommendations }),
      ...(prep_time && { prep_time: Number(prep_time) }),
      ...(total_time && { total_time: Number(total_time) }),
      ...(ingredients && { ingredients: JSON.parse(ingredients) }),
      ...(steps && { steps: JSON.parse(steps) }),
      ...(is_private && { is_private: JSON.parse(is_private) }),
    };
  } catch (error) {
    res.status(400);
    throw new Error("Invalid recipe data");
  }
  // Get image if user provided one
  if (req.file) {
    try {
      recipeData.image = await uploadFileToBlob(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
    }
  }
  // Update the recipe
  const recipe = req.recipe;
  recipe.name = recipe_data.name || recipe.name;
  recipe.origin = recipe_data.origin || recipe.origin;
  recipe.recommendations =
    recipe_data.recommendations || recipe.recommendations;
  recipe.prep_time = recipe_data.prep_time || recipe.prep_time;
  recipe.total_time = recipe_data.total_time || recipe.total_time;
  recipe.ingredients = recipe_data.ingredients || recipe.ingredients;
  recipe.steps = recipe_data.steps || recipe.steps;
  recipe.is_private =
    recipe_data.is_private !== undefined
      ? recipe_data.is_private
      : recipe.is_private;
});

// @desc    Get family recipes
// @route   GET /api/recipes/familyrecipes/:family_id
// @access  Private, familyMember
const getFamilyRecipes = asyncHandler(async (req, res) => {
  // Send only the needed data
  const recipes = await Recipe.find({
    creator_id: { $in: req.family.members },
  }).populate("creator_id", "username");
  const recipesToSend = recipes.map((recipe) => {
    return {
      _id: recipe._id,
      name: recipe.name,
      image: recipe.image,
      creator_username: recipe.user.username,
    };
  });
  res.json(recipesToSend);
});

// @desc    Get recipes from all user families
// @route   GET /api/recipes/familyrecipes
// @access  Private
const getRecipesFromUserFamilies = asyncHandler(async (req, res) => {
  // Find all user families
  const families = await Family.find({ members: req.user._id });
  // Find recipes from all user families
  const recipes = await Recipe.find({ creator_id: { $in: families } });
  // Send only the needed data
  const recipesToSend = recipes.map((recipe) => {
    return {
      _id: recipe._id,
      name: recipe.name,
      image: recipe.image,
    };
  });
  res.json(recipesToSend);
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:recipe_id
// @access  Private, recipeOwner
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = Recipe.findByIdAndDelete(req.params.recipe_id);
  if (recipe) {
    res.json({ message: "Recipe deleted" });
  } else {
    res.status(404);
    throw new Error("Recipe not found");
  }
});

export {
  addRecipe,
  getUserRecipes,
  getRecipe,
  editRecipe,
  getFamilyRecipes,
  getRecipesFromUserFamilies,
  deleteRecipe,
};
