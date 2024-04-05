import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import Recipe from "../models/recipeModel.js";

const recipeOwner = asyncHandler(async (req, res, next) => {
  // Check if recipe_id is castable to ObjectId
  if (!req.params.recipe_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
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
      // If the user is not the author of the recipe, return an error
      res.status(401);
      throw new Error("Not authorized as recipe owner");
    }
  } else {
    // If the recipe is not found, return an error
    res.status(404);
    throw new Error("Recipe not found");
  }
});

const recipeAuthorized = asyncHandler(async (req, res, next) => {
  // Check if recipe_id is castable to ObjectId
  if (!req.params.recipe_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  // Find the recipe by ID
  const recipe = await Recipe.findById(req.params.recipe_id);
  // Check if the recipe exists
  if (recipe) {
    // Check if the user is the recipe author or recipe is public
    if (
      recipe.author_id.toString() === req.user._id.toString() ||
      recipe.visibility === "public"
    ) {
      // Grant access if the user is the author of the recipe or the recipe is public
      req.recipe = recipe;
      next();
    } else {
      // Check if recipe is private
      if (recipe.visibility === "private") {
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
        // Grant access if user is in a common family with the author
        req.recipe = recipe;
        next();
      } else {
        // Return error if user is not authorized to view the recipe
        res.status(403);
        throw new Error("Not authorized for this recipe");
      }
    }
  } else {
    // Return error if recipe is not found
    res.status(404);
    throw new Error("Recipe not found");
  }
});

export { recipeOwner, recipeAuthorized };
