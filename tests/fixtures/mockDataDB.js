import mongoose from "mongoose";

const user1Id = new mongoose.Types.ObjectId();
const user2Id = new mongoose.Types.ObjectId();
const user3Id = new mongoose.Types.ObjectId();

const family1Id = new mongoose.Types.ObjectId();
const family2Id = new mongoose.Types.ObjectId();
const family3Id = new mongoose.Types.ObjectId();

const recipe1Id = new mongoose.Types.ObjectId();
const recipe2Id = new mongoose.Types.ObjectId();
const recipe3Id = new mongoose.Types.ObjectId();
const recipe4Id = new mongoose.Types.ObjectId();

const userFixtures = [
  {
    _id: user1Id,
    name: "User 1",
    email: "user1@example.com",
    password: "password1",
    username: "user1",
    favorites: [recipe1Id],
  },
  {
    _id: user2Id,
    name: "User 2",
    email: "user2@example.com",
    password: "password2",
    username: "user2",
  },
  {
    _id: user3Id,
    name: "User 3",
    email: "user3@example.com",
    password: "password3",
    username: "user3",
    invites: [
      {
        family_id: family1Id,
        inviter_id: user1Id,
      },
    ],
  },
];

const familyFixtures = [
  {
    _id: family1Id,
    name: "Family 1",
    members: [
      {
        user_id: user1Id,
        admin: true,
      },
      {
        user_id: user2Id,
        admin: false,
      },
    ],
    invites: [user3Id],
  },
  {
    _id: family2Id,
    name: "Family 2",
    members: [
      {
        user_id: user2Id,
        admin: true,
      },
      {
        user_id: user1Id,
        admin: false,
      },
    ],
  },
  {
    _id: family3Id,
    name: "Family 3",
    members: [
      {
        user_id: user3Id,
        admin: true,
      },
      {
        user_id: user2Id,
        admin: false,
      },
    ],
  },
];

const recipeFixtures = [
  {
    _id: recipe1Id,
    name: "Recipe 1",
    creator_id: user1Id,
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    is_private: false,
  },
  {
    _id: recipe2Id,
    name: "Recipe 2",
    creator_id: user2Id,
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    is_private: true,
  },
  {
    _id: recipe3Id,
    name: "Recipe 3",
    creator_id: user3Id,
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    is_private: false,
  },
  {
    _id: recipe4Id,
    name: "Recipe 4",
    creator_id: user2Id,
    prep_time: 10,
    total_time: 20,
    ingredients: ["ingredient1", "ingredient2"],
    steps: ["instruction1", "instruction2"],
    recommendations: "recommendation",
    origin: "origin",
    is_private: false,
  },
];

export { userFixtures, familyFixtures, recipeFixtures };
