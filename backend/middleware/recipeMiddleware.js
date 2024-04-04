import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import Recipe from "../models/recipeModel.js";

const recipeOwner = asyncHandler(async (req, res, next) => {
  // Find the recipe by ID
  const recipe = await Recipe.findById(req.params.recipe_id);
  // Check if the recipe exists
  if (recipe) {
    // Check if the recipe author ID matches the logged in user ID
    if (recipe.author_id.toString() === req.user._id.toString()) {
      // If the user is the author of the recipe, grant access
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

const recipeAuthorized = asyncHandler(async (req, res, next) => {
  // Find the recipe by ID
  const recipe = await Recipe.findById(req.params.recipe_id);
  // Check if the recipe exists
  if (recipe) {
    // Check if the user is the recipe author or recipe is public
    if (
      recipe.author_id.toString() === req.user._id.toString() ||
      !recipe.visibility === "public"
    ) {
      // Grant access if the user is the author of the recipe or the recipe is public
      req.recipe = recipe;
      next();
    } else {
      // Check if recipe is private
      if (recipe.is_private) {
        res.status(403);
        throw new Error("Private recipe. Not authorized as recipe owner");
      }
      // Look if user is in a common family with author
      const family = await Family.findOne({
        members: {
          $all: [recipe.author_id, req.user._id],
        },
      });
      if (family) {
        req.recipe = recipe;
        next();
      } else {
        res.status(403);
        throw new Error("Not authorized for this recipe");
      }
    }
  } else {
    res.status(404);
    throw new Error("Recipe not found");
  }
});

export { recipeOwner, recipeAuthorized };
