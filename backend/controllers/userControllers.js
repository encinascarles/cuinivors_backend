import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Family from "../models/familyModel.js";
import Recipe from "../models/recipeModel.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user provided with correct data
  if (!email || !password) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if user exists and password matches
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    //return user data and token
    generateToken(res, user._id);
    res.json({
      name: user.name,
      email: user.email,
      username: user.username,
      invites: user.invites,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, username } = req.body;
  //check if user provided with correct data
  if (!name || !email || !password || !username) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  //check if username is already taken
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error("Username already taken");
  }
  //create new user
  const user = await User.create({
    name,
    email,
    password,
    username,
  });
  //return user data and token
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      name: user.name,
      email: user.email,
      username: user.username,
      invites: user.invites,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  //clear cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successufuly" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    username: req.user.username,
    invites: req.user.invites,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  //update user data
  req.user.name = req.body.name || req.user.name;
  req.user.email = req.body.email || req.user.email;
  req.user.username = req.body.username || req.user.username;
  if (req.body.password) {
    req.user.password = req.body.password;
  }
  const updatedUser = await req.user.save();
  //return updated user data
  res.json({
    name: updatedUser.name,
    email: updatedUser.email,
    username: updatedUser.username,
    invites: updatedUser.invites,
  });
});

// @desc    Add favorite recipe
// @route   POST /api/users/favorites/add
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { recipe_id } = req.body;
  //check if user provided with correct data
  if (!recipe_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if recipe is already in favorites
  if (req.user.favorites.includes(recipe_id)) {
    res.status(400);
    throw new Error("Recipe already in favorites");
  }
  //add recipe to favorites
  req.user.favorites.push(recipe_id);
  const updatedUser = await req.user.save();
  res.status(201).json({
    message: "Recipe added to favorites",
  });
});

// @desc    Remove favorite recipe
// @route   POST /api/users/favorites/remove
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const { recipe_id } = req.body;
  //check if user provided with correct data
  if (!recipe_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if recipe is in favorites
  if (!req.user.favorites.includes(recipe_id)) {
    res.status(400);
    throw new Error("Recipe not in favorites");
  }
  //remove recipe from favorites
  req.user.favorites = req.user.favorites.filter(
    (favorite) => favorite.toString() !== recipe_id
  );
  //save updated user data
  const updatedUser = await req.user.save();
  res.status(201).json({
    message: "Recipe removed from favorites",
  });
});

// @desc    Delete User
// @route   DELETE /api/users/
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  //delete user recipes
  await Recipe.deleteMany({ creator_id: req.user._id });
  //delete invites
  await Family.updateMany(
    { "members.user_id": req.user._id },
    { $pull: { members: { user_id: req.user._id } } }
  );
  //delete user
  const user = await User.findByIdAndDelete(req.user._id);
  if (user) {
    res.status(200).json({
      message: "User deleted",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Accept Invite
// @route   PUSH /api/users/invites/accept
// @access  Private
const acceptInvite = asyncHandler(async (req, res) => {
  const { invite_id } = req.body;
  //check if user provided with correct data
  if (!invite_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if user has invite
  if (!req.user.invites.some((invite) => invite._id.toString() === invite_id)) {
    res.status(400);
    throw new Error("Invite not  valid");
  }
  //find family id
  const { family_id } = req.user.invites.find(
    (invite) => invite._id.toString() === invite_id.toString()
  );
  //remove invite from user model
  req.user.invites = req.user.invites.filter(
    (invite) => invite._id.toString() !== invite_id
  );
  const updatedUser = await req.user.save();
  //add user to family and remove invite from family model
  const family = await Family.findById(family_id);
  if (family) {
    family.members.push({ user_id: req.user._id });
    family.invites = family.invites.filter(
      (invite) => invite.toString() !== req.user._id.toString()
    );
    await family.save();
    //return success message
    res.status(201).json({
      message: "Invite accepted",
    });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Decline Invite
// @route   PUSH /api/users/invites/decline
// @access  Private
const declineInvite = asyncHandler(async (req, res) => {
  const { invite_id } = req.body;
  //check if user provided with correct data
  if (!invite_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if user has invite
  if (
    !req.user.invites.some(
      (invite) => invite._id.toString() === invite_id.toString()
    )
  ) {
    res.status(400);
    throw new Error("User has no invite");
  }
  //find family id
  const { family_id } = req.user.invites.find(
    (invite) => invite._id.toString() === invite_id.toString()
  );
  //remove invite from user model
  req.user.invites = req.user.invites.filter(
    (invite) => invite._id.toString() !== invite_id.toString()
  );
  const updatedUser = await req.user.save();
  //remove invite from family model
  const family = await Family.findById(family_id);
  if (family) {
    family.invites = family.invites.filter(
      (invite) => invite.toString() !== req.user._id.toString()
    );
    await family.save();
    //return success message
    res.status(201).json({
      message: "Invite declined",
    });
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  deleteUser,
  acceptInvite,
  declineInvite,
};
