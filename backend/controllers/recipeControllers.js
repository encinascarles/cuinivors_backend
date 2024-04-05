import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Add new recipe
// @route   POST /api/recipes
// @access  Private
const addRecipe = asyncHandler(async (req, res) => {
  // Get the data from the request
  const newRecipe = {
    name: req.body.name,
    prep_time: Number(req.body.prep_time),
    total_time: Number(req.body.total_time),
    ingredients: JSON.parse(req.body.ingredients),
    steps: JSON.parse(req.body.steps),
    recommendations: req.body.recommendations,
    origin: req.body.origin,
    visibility: req.body.visibility,
  };
  // Check there isn't already a recipe with the same name from the same user
  const existingRecipe = await Recipe.findOne({
    name: newRecipe.name,
    author_id: req.user._id,
  });
  if (existingRecipe) {
    res.status(400);
    throw new Error("User already has a recipe with that name");
  }
  // Create the recipe
  const recipe = await Recipe.create({
    ...newRecipe,
    author_id: req.user._id,
  });
  // Handle the image upload if the user provided one
  if (req.file) {
    try {
      recipe.recipe_image = await uploadFileToBlob(
        req.file,
        "recipe_images",
        `${recipe._id.toString()}_1`
      );
      await recipe.save();
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
    }
  }
  // Check if the recipe was created
  if (recipe) {
    // Send the recipe data if the recipe was created
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
    // Send an error if the recipe was not created
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
  res.status(200).json({
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
  // Get the data from the request
  let recipe = {
    name: req.body.name,
    prep_time: req.body.prep_time ? Number(req.body.prep_time) : undefined,
    total_time: req.body.total_time ? Number(req.body.total_time) : undefined,
    ingredients: req.body.ingredients
      ? JSON.parse(req.body.ingredients)
      : undefined,
    steps: req.body.steps ? JSON.parse(req.body.steps) : undefined,
    recommendations: req.body.recommendations,
    origin: req.body.origin,
    visibility: req.body.visibility,
  };
  // Check there isn't already a recipe with the same name from the same user
  const existingRecipe = await Recipe.findOne({
    name: recipe.name,
    author_id: req.user._id,
  });
  if (existingRecipe && existingRecipe._id.toString() !== req.recipe._id) {
    res.status(400);
    throw new Error("User already has a recipe with that name");
  }
  // Handle the image upload if the user provided one
  let oldImageName;
  let newImageName;
  if (req.file) {
    const oldImageUrl = req.recipe.recipe_image;
    oldImageName = oldImageUrl.substring(oldImageUrl.lastIndexOf("/") + 1);
    newImageName =
      oldImageName === "default"
        ? `${req.params.recipe_id}_1`
        : oldImageName.slice(0, -1) + (parseInt(oldImageName.slice(-1)) + 1);
    try {
      // Upload the new image
      recipe.recipe_image = await uploadFileToBlob(
        req.file,
        "recipe_images",
        newImageName
      );
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
  // Check if the recipe was updated
  if (updatedRecipe) {
    // Delete the old image if the recipe image was updated
    if (req.file && oldImageName !== "default") {
      await deleteBlob(oldImageName);
    }
    // Send the updated recipe data if the recipe was updated
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
    // Delete the new image if the recipe was not updated
    if (req.file) {
      await deleteBlob(newImageName);
    }
    // Send an error if the recipe was not updated
    res.status(400);
    throw new Error("Invalid recipe data");
  }
});

// @desc    Get public recipes
// @route   GET /api/recipes/public
// @access  Public
const getPublicRecipes = asyncHandler(async (req, res) => {
  // Find all public recipes
  const recipes = await Recipe.find({ visibility: "public" });
  // Send the recipes data
  res.status(200).json({
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
  // Check if the recipe is already in favorites
  if (req.user.favorites.includes(req.recipe._id)) {
    res.status(400);
    throw new Error("Recipe already in favorites");
  }
  // Add the recipe to favorites
  req.user.favorites.push(req.recipe._id);
  await req.user.save();
  // Send a success message
  res.status(200).json({ message: "Recipe added to favorites" });
});

// @desc    Remove recipe from favorites
// @route   DELETE /api/recipes/:recipe_id/favorite
// @access  Private, recipeAuthorized
const removeFavorite = asyncHandler(async (req, res) => {
  // Check if the recipe is in favorites
  if (!req.user.favorites.includes(req.recipe._id)) {
    res.status(400);
    throw new Error("Recipe not in favorites");
  }
  // Remove the recipe from favorites
  req.user.favorites = req.user.favorites.filter(
    (recipe) => recipe.toString() !== req.recipe._id.toString()
  );
  await req.user.save();
  // Send a success message
  res.status(200).json({ message: "Recipe removed from favorites" });
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:recipe_id
// @access  Private, recipeOwner
const deleteRecipe = asyncHandler(async (req, res) => {
  // Delete the recipe
  const recipe = await Recipe.findByIdAndDelete(req.recipe._id);
  // Check if the recipe was deleted
  if (recipe) {
    // Send a success message if the recipe was deleted
    res.status(200).json({ message: "Recipe deleted" });
  } else {
    // Send an error if the recipe was not deleted
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
