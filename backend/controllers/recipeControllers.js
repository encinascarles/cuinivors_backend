import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Add new recipe
// @route   POST /api/recipes
// @access  Private
const addRecipe = asyncHandler(async (req, res) => {
  // Check if the user provided all the necessary data
  if (
    !req.body.name ||
    !req.body.prep_time ||
    !req.body.total_time ||
    !req.body.ingredients ||
    !req.body.steps ||
    !req.body.recommendations ||
    !req.body.origin ||
    !req.body.visibility
  ) {
    res.status(400);
    throw new Error("Not valid data, data missing");
  }
  // Declare the variables
  let newRecipe = {};
  // Get the data from the request
  try {
    newRecipe.name = req.body.name;
    newRecipe.prep_time = Number(req.body.prep_time);
    if (isNaN(newRecipe.prep_time)) throw new Error();
    newRecipe.total_time = Number(req.body.total_time);
    if (isNaN(newRecipe.total_time)) throw new Error();
    newRecipe.ingredients = JSON.parse(req.body.ingredients);
    newRecipe.steps = JSON.parse(req.body.steps);
    newRecipe.recommendations = req.body.recommendations;
    newRecipe.origin = req.body.origin;
    newRecipe.visibility = req.body.visibility;
  } catch (error) {
    res.status(400);
    throw new Error("Invalid recipe data, not parsable");
  }
  //Check if the user provided an image
  if (req.file) {
    try {
      newRecipe.recipe_image = await uploadFileToBlob(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
    }
  }
  // Create the recipe
  const recipe = await Recipe.create({
    ...newRecipe,
    author_id: req.user._id,
  });
  // Send the recipe data
  if (recipe) {
    res.status(201).json({
      message: "Recipe created",
      recipe: {
        _id: recipe._id,
        name: recipe.name,
        prep_time: recipe.prep_time,
        total_time: recipe.total_time,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        recommendations: recipe.recommendations,
        origin: recipe.origin,
        recipe_image: recipe.recipe_image,
        visibility: recipe.visibility,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid recipe data");
  }
});

// @desc    Get  recipe by id
// @route   GET /api/recipes/:recipe_id
// @access  Private, recipeAuthorized
const getRecipe = asyncHandler(async (req, res) => {
  // Find recipe creator
  const author = await User.findById(req.recipe.author_id);
  // Send the recipe data
  res.json({
    recipe: {
      _id: req.recipe._id,
      name: req.recipe.name,
      prep_time: req.recipe.prep_time,
      total_time: req.recipe.total_time,
      ingredients: req.recipe.ingredients,
      steps: req.recipe.steps,
      recommendations: req.recipe.recommendations,
      origin: req.recipe.origin,
      recipe_image: req.recipe.recipe_image,
      visibility: req.recipe.visibility,
      author: author.username,
    },
  });
});

// @desc    Edit a recipe
// @route   PUT /api/recipes/:recipe_id
// @access  Private, recipeOwner
const editRecipe = asyncHandler(async (req, res) => {
  // Declare the variables
  let recipe = {};
  // Get the data from the request
  try {
    if (req.body.name) recipe.name = req.body.name;
    if (req.body.prep_time) recipe.prep_time = Number(req.body.prep_time);
    if (req.body.total_time) recipe.total_time = Number(req.body.total_time);
    if (req.body.ingredients)
      recipe.ingredients = JSON.parse(req.body.ingredients);
    if (req.body.steps) recipe.steps = JSON.parse(req.body.steps);
    if (req.body.recommendations)
      recipe.recommendations = req.body.recommendations;
    if (req.body.origin) recipe.origin = req.body.origin;
    if (req.body.visibility) recipe.visibility = req.body.visibility;
  } catch (error) {
    res.status(400);
    throw new Error("Invalid recipe data, not parsable");
  }
  //Check if the user provided an image
  if (req.file) {
    try {
      recipe.recipe_image = await uploadFileToBlob(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
    }
  }
  // Update the recipe
  const updatedRecipe = await Recipe.findByIdAndUpdate(
    req.params.recipe_id,
    { $set: recipe },
    { new: true }
  );
  // Send the updated recipe data
  if (updatedRecipe) {
    res.json({
      message: "Recipe updated",
      recipe: {
        _id: updatedRecipe._id,
        name: updatedRecipe.name,
        prep_time: updatedRecipe.prep_time,
        total_time: updatedRecipe.total_time,
        ingredients: updatedRecipe.ingredients,
        steps: updatedRecipe.steps,
        recommendations: updatedRecipe.recommendations,
        origin: updatedRecipe.origin,
        recipe_image: updatedRecipe.recipe_image,
        visibility: updatedRecipe.visibility,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid recipe data");
  }
});

// @desc    Get public recipes
// @route   GET /api/recipes/public
// @access  Public
const getPublicRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ visibility: "public" });
  res.json({
    recipes: recipes.map((recipe) => {
      return {
        _id: recipe._id,
        name: recipe.name,
        prep_time: recipe.prep_time,
        total_time: recipe.total_time,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        recommendations: recipe.recommendations,
        origin: recipe.origin,
        recipe_image: recipe.recipe_image,
      };
    }),
  });
});

// @desc    Add recipe to favorites
// @route   PUT /api/recipes/:recipe_id/favorite
// @access  Private, recipeAuthorized
const addFavorite = asyncHandler(async (req, res) => {
  if (req.user.favorites.includes(req.recipe._id)) {
    res.status(400);
    throw new Error("Recipe already in favorites");
  }
  req.user.favorites.push(req.recipe._id);
  await req.user.save();
  res.status(200).json({ message: "Recipe added to favorites" });
});

// @desc    Remove recipe from favorites
// @route   DELETE /api/recipes/:recipe_id/favorite
// @access  Private, recipeAuthorized
const removeFavorite = asyncHandler(async (req, res) => {
  if (!req.user.favorites.includes(req.recipe._id)) {
    res.status(400);
    throw new Error("Recipe not in favorites");
  }
  req.user.favorites = req.user.favorites.filter(
    (recipe) => recipe.toString() !== req.recipe._id.toString()
  );
  await req.user.save();
  res.status(200).json({ message: "Recipe removed from favorites" });
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:recipe_id
// @access  Private, recipeOwner
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findByIdAndDelete(req.recipe._id);
  if (recipe) {
    res.json({ message: "Recipe deleted" });
  } else {
    res.status(404);
    throw new Error("Recipe not found");
  }
});

export {
  addRecipe,
  getRecipe,
  editRecipe,
  getPublicRecipes,
  addFavorite,
  removeFavorite,
  deleteRecipe,
};
