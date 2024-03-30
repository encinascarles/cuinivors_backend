import asyncHandler from "express-async-handler";
import Recipe from "../models/recipeModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Add new recipe
// @route   POST /api/recipes
// @access  Private
const addRecipe = asyncHandler(async (req, res) => {
  const { name, origin, recommendations } = req.body;

  const prepTime = Number(req.body.prepTime);
  const totalTime = Number(req.body.totalTime);
  const ingredients = JSON.parse(req.body.ingredients);
  const steps = JSON.parse(req.body.steps);
  const isPrivate = JSON.parse(req.body.private);

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
    creator_id: req.user._id,
    name,
    prepTime,
    totalTime,
    ingredients,
    steps,
    recommendations,
    origin,
    image: imageUrl,
    private: isPrivate,
  });

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
  if (req.user) {
    const recipes = await Recipe.find({ creator_id: req.user._id });

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
  // Buscar la receta por id y usuario
  const recipe = await Recipe.findOne({
    _id: recipe_id,
  });
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  } else if (!recipe.creator_id.equals(req.user._id)) {
    if (recipe.private) {
      return res.status(404).json({ message: "Not allowed to view recipe" });
    }
    //look if recipe's creator is in a common family with the user
    const family = await Family.findOne({
      members: { $in: [req.user._id, recipe.creator_id] },
    });

    if (!family) {
      return res.status(401).json({ message: "Recipe not found" });
    }
  }
  const creator_username = await User.findOne({
    _id: recipe.creator_id,
  }).select("username");
  res.json({
    _id: recipe._id,
    name: recipe.name,
    origin: recipe.origin,
    recommendations: recipe.recommendations,
    prepTime: recipe.prepTime,
    totalTime: recipe.totalTime,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    private: recipe.private,
    image: recipe.image,
    creator_username: creator_username.username,
  });
});

// @desc    Edit a recipe
// @route   PUT /api/recipes/
// @access  Private
const editRecipe = asyncHandler(async (req, res) => {
  const { name, origin, recommendations } = req.body;

  const prepTime = Number(req.body.prepTime);
  const totalTime = Number(req.body.totalTime);
  const ingredients = JSON.parse(req.body.ingredients);
  const steps = JSON.parse(req.body.steps);
  const isPrivate = JSON.parse(req.body.private);

  const newRecipeData = {
    name,
    origin,
    recommendations,
    prepTime,
    totalTime,
    ingredients,
    steps,
    private: isPrivate,
  };

  if (req.file) {
    let imageUrl = "";
    try {
      imageUrl = await uploadFileToBlob(req.file);
      newRecipeData.image = imageUrl;
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
      return;
    }
  }

  const { recipe_id } = req.params;

  const recipe = await Recipe.findOneAndUpdate(
    { _id: recipe_id, creator_id: req.user._id },
    newRecipeData,
    { new: true }
  );
  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found");
  }
  res.json(recipe);
});

// @desc    Get family recipes
// @route   GET /api/recipes/familyrecipes/:family_id
// @access  Private
const getFamilyRecipes = asyncHandler(async (req, res) => {
  const { family_id } = req.params;
});

export { addRecipe, getUserRecipes, getRecipe, editRecipe };
