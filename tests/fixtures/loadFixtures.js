import User from "../../backend/models/userModel.js";
import Family from "../../backend/models/familyModel.js";
import Recipe from "../../backend/models/recipeModel.js";
import Invite from "../../backend/models/inviteModel.js";
import {
  userFixtures,
  familyFixtures,
  recipeFixtures,
  inviteFixtures,
} from "./mockDataDB.js";

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

const loadInvites = async () => {
  try {
    for (const invite of inviteFixtures) {
      await Invite.create(invite);
    }
  } catch (error) {
    console.error("Error loading invites fixtures:", error);
  }
};

const loadFixtures = async () => {
  await Promise.all([
    loadUsers(),
    loadFamilies(),
    loadRecipes(),
    loadInvites(),
  ]);
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

const clearInvites = async () => {
  try {
    await Invite.deleteMany();
  } catch (error) {
    console.error("Error clearing invites fixtures:", error);
  }
};

const clearFixtures = async () => {
  await Promise.all([
    clearUsers(),
    clearFamilies(),
    clearRecipes(),
    clearInvites(),
  ]);
};

const refreshUsers = async () => {
  await clearUsers();
  await loadUsers();
};

const refreshFamilies = async () => {
  await clearFamilies();
  await loadFamilies();
};

const refreshRecipes = async () => {
  await clearRecipes();
  await loadRecipes();
};

const refreshInvites = async () => {
  await clearInvites();
  await loadInvites();
};

const refreshFixtures = async () => {
  await clearFixtures();
  await loadFixtures();
};

export {
  loadUsers,
  loadFamilies,
  loadRecipes,
  loadInvites,
  loadFixtures,
  clearUsers,
  clearFamilies,
  clearRecipes,
  clearInvites,
  clearFixtures,
  refreshUsers,
  refreshFamilies,
  refreshRecipes,
  refreshInvites,
  refreshFixtures,
};
