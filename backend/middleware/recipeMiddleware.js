import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import Recipe from "../models/recipeModel.js";

const recipeOwner = asyncHandler(async (req, res, next) => {
  // Find the recipe by ID
  const recipe = await Recipe.findById(req.params.recipe_id);
  // Check if the recipe exists
  if (recipe) {
    // Check if the recipe creator ID matches the logged in user ID
    if (recipe.creator_id.toString() === req.user._id.toString()) {
      // If the user is the creator of the recipe, grant access
      req.recipe = recipe;
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized as recipe owner");
    }
  } else {
    res.status(404);
    throw new Error("Recipe not found");
  }
});

const recipeFamilyAuthorized = asyncHandler(async (req, res, next) => {
  // Find the recipe by ID
  const recipe = await Recipe.findById(req.params.recipe_id);
  // Check if the recipe exists
  if (recipe) {
    // Check if the user is the recipe creator
    if (recipe.creator_id.toString() === req.user._id.toString()) {
      // If the user is the creator of the recipe, grant access
      req.recipe = recipe;
      next();
    } else {
      // Check if recipe is private
      if (recipe.is_private) {
        res.status(401);
        throw new Error("Private recipe. Not authorized as recipe owner");
      }
      // Look if user is in a common family with creator
      const family = await Family.findOne({
        "members.user_id": { $all: [recipe.creator_id, req.user._id] },
      });
      if (family) {
        req.recipe = recipe;
        next();
      } else {
        res.status(401);
        throw new Error("Not authorized as recipe owner or family member");
      }
    }
  } else {
    res.status(404);
    throw new Error("Recipe not found");
  }
});

export { recipeOwner, recipeFamilyAuthorized };
