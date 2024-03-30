import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
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
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    username,
  });

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
  if (req.user) {
    res.json({
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      invites: req.user.invites,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      invites: updatedUser.invites,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Add favorite recipe
// @route   POST /api/users/favorites/add
// @access  Private

const addFavorite = asyncHandler(async (req, res) => {
  const { recipe_id } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    //check if recipe is already in favorites
    if (user.favorites.includes(recipe_id)) {
      res.status(400);
      throw new Error("Recipe already in favorites");
    }
    user.favorites.push(recipe_id);
    const updatedUser = await user.save();
    res.status(201).json({
      message: "Recipe added to favorites",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Remove favorite recipe
// @route   POST /api/users/favorites/remove
// @access  Private

const removeFavorite = asyncHandler(async (req, res) => {
  const { recipe_id } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    if (!user.favorites.includes(recipe_id)) {
      res.status(400);
      throw new Error("Recipe not in favorites");
    }
    user.favorites = user.favorites.filter(
      (favorite) => favorite.toString() !== recipe_id
    );
    const updatedUser = await user.save();
    res.status(201).json({
      message: "Recipe removed from favorites",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
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

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  deleteUser,
};
