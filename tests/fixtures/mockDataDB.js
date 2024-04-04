import mongoose from "mongoose";

const user1Id = new mongoose.Types.ObjectId();
const user2Id = new mongoose.Types.ObjectId();
const user3Id = new mongoose.Types.ObjectId();
const user4Id = new mongoose.Types.ObjectId();

const family1Id = new mongoose.Types.ObjectId();
const family2Id = new mongoose.Types.ObjectId();
const family3Id = new mongoose.Types.ObjectId();
const family4Id = new mongoose.Types.ObjectId();

const recipe1Id = new mongoose.Types.ObjectId();
const recipe2Id = new mongoose.Types.ObjectId();
const recipe3Id = new mongoose.Types.ObjectId();
const recipe4Id = new mongoose.Types.ObjectId();
const recipe5Id = new mongoose.Types.ObjectId();

const invite1Id = new mongoose.Types.ObjectId();
const invite2Id = new mongoose.Types.ObjectId();

const userFixtures = [
  {
    _id: user1Id,
    name: "User 1",
    username: "user1",
    email: "user1@example.com",
    password: "password1",
    profile_image: "/images/users/user1.jpg",
    favorites: [recipe1Id],
  },
  {
    _id: user2Id,
    name: "User 2",
    username: "user2",
    email: "user2@example.com",
    password: "password2",
    profile_image: "/images/users/user2.jpg",
    favorites: [],
  },
  {
    _id: user3Id,
    name: "User 3",
    username: "user3",
    email: "user3@example.com",
    password: "password3",
    profile_image: "/images/users/user3.jpg",
    favorites: [],
  },
  {
    _id: user4Id,
    name: "User 4",
    username: "user4",
    email: "user4@example.com",
    password: "password4",
    profile_image: "/images/users/user4.jpg",
    favorites: [],
  },
];

const familyFixtures = [
  {
    _id: family1Id,
    name: "Family 1",
    description: "Family 1 description",
    family_image: "/images/families/family1.jpg",
    members: [user1Id, user2Id],
    admins: [user1Id],
  },
  {
    _id: family2Id,
    name: "Family 2",
    description: "Family 2 description",
    family_image: "/images/families/family2.jpg",
    members: [user1Id, user2Id],
    admins: [user2Id],
  },
  {
    _id: family3Id,
    name: "Family 3",
    description: "Family 3 description",
    family_image: "/images/families/family3.jpg",
    members: [user2Id, user3Id],
    admins: [user3Id],
  },
  {
    _id: family4Id,
    name: "Family 4",
    description: "Family 4 description",
    family_image: "/images/families/family4.jpg",
    members: [user1Id, user4Id],
    admins: [user4Id, user1Id],
  },
];

const recipeFixtures = [
  {
    _id: recipe1Id,
    name: "Recipe 1",
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    recipe_image: "/images/recipes/recipe1.jpg",
    visibility: "family",
    author_id: user1Id,
  },
  {
    _id: recipe2Id,
    name: "Recipe 2",
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    recipe_image: "/images/recipes/recipe2.jpg",
    visibility: "private",
    author_id: user2Id,
  },
  {
    _id: recipe3Id,
    name: "Recipe 3",
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    recipe_image: "/images/recipes/recipe3.jpg",
    visibility: "family",
    author_id: user3Id,
  },
  {
    _id: recipe4Id,
    name: "Recipe 4",
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    recipe_image: "/images/recipes/recipe4.jpg",
    visibility: "public",
    author_id: user2Id,
  },
  {
    _id: recipe5Id,
    name: "Recipe 5",
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    recipe_image: "/images/recipes/recipe5.jpg",
    visibility: "public",
    author_id: user4Id,
  },
];

const inviteFixtures = [
  {
    _id: invite1Id,
    inviter_user_id: user1Id,
    invited_user_id: user3Id,
    family_id: family1Id,
  },
  {
    _id: invite2Id,
    inviter_user_id: user3Id,
    invited_user_id: user4Id,
    family_id: family3Id,
  },
];

export { userFixtures, familyFixtures, recipeFixtures, inviteFixtures };
