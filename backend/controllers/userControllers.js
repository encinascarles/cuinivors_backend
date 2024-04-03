import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Family from "../models/familyModel.js";
import Recipe from "../models/recipeModel.js";
import Invite from "../models/inviteModel.js";

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  //check if user provided with correct data
  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  //check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error("User already exists with this username");
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
      message: "User created",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profile_image: user.profile_image,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

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
    res.status(200).json({
      message: "User logged in",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profile_image: user.profile_image,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
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
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      profile_image: req.user.profile_image,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
//todo implement image upload
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
  res.status(200).json({
    message: "User updated",
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      profile_image: req.user.profile_image,
    },
  });
});

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:user_id
// @access  Public
const getUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.user_id);
  if (user) {
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profile_image: user.profile_image,
      },
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    List user families
// @route   GET /api/users/families
// @access  Private
const getUserFamilies = asyncHandler(async (req, res) => {
  const families = await Family.find({ members: req.user._id });
  res.status(200).json({ families });
});

// @desc    List user recipes
// @route   GET /api/users/recipes
// @access  Private
const getUserRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ author_id: req.user._id });
  res.status(200).json({ recipes });
});

// @desc    Delete User
// @route   DELETE /api/users/
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  //delete user recipes
  await Recipe.deleteMany({ author_id: req.user._id });
  //delete invites where user is invited or inviter
  await Invite.deleteMany({
    $or: [{ invited_user_id: req.user._id }, { inviter_user_id: req.user._id }],
  });
  //delete user from families, if user is last admin, delete family
  const families = await Family.find({ members: req.user._id });
  for (let family of families) {
    if (
      family.admins.length === 1 &&
      family.admins[0].toString() === req.user._id.toString()
    ) {
      await Family.findByIdAndDelete(family._id);
    } else {
      family.members = family.members.filter(
        (member) => member.toString() !== req.user._id.toString()
      );
      family.admins = family.admins.filter(
        (admin) => admin.toString() !== req.user._id.toString()
      );
      await family.save();
    }
  }
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
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  getUserProfileById,
  getUserFamilies,
  getUserRecipes,
  updateUserProfile,
  deleteUser,
};
