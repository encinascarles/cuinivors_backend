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
  await loadUsers();
  await loadFamilies();
  await loadRecipes();
  await loadInvites();
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
  await clearUsers();
  await clearFamilies();
  await clearRecipes();
  await clearInvites();
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
};
