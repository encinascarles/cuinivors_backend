import User from "../../backend/models/userModel.js";
import Family from "../../backend/models/familyModel.js";
import Recipe from "../../backend/models/recipeModel.js";
import { userFixtures, familyFixtures, recipeFixtures } from "./mockDataDB.js";

const loadUsers = async () => {
  try {
    for (const user of userFixtures) {
      await User.create(user);
    }
  } catch (error) {
    console.error("Error loading users fixtures:", error);
  }
};

const loadFamilies = async () => {
  try {
    for (const family of familyFixtures) {
      await Family.create(family);
    }
  } catch (error) {
    console.error("Error loading families fixtures:", error);
  }
};

const loadRecipes = async () => {
  try {
    for (const recipe of recipeFixtures) {
      await Recipe.create(recipe);
    }
  } catch (error) {
    console.error("Error loading recipes fixtures:", error);
  }
};

const loadFixtures = async () => {
  await loadUsers();
  await loadFamilies();
  await loadRecipes();
};

const clearUsers = async () => {
  try {
    await User.deleteMany();
  } catch (error) {
    console.error("Error clearing users fixtures:", error);
  }
};

const clearFamilies = async () => {
  try {
    await Family.deleteMany();
  } catch (error) {
    console.error("Error clearing families fixtures:", error);
  }
};

const clearRecipes = async () => {
  try {
    await Recipe.deleteMany();
  } catch (error) {
    console.error("Error clearing recipes fixtures:", error);
  }
};

export default loadFixtures;
export {
  loadUsers,
  loadFamilies,
  loadRecipes,
  clearUsers,
  clearFamilies,
  clearRecipes,
};
