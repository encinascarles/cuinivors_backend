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
  // Check if user provided with correct data
  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error("Not valid data");
  }
  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error("User already exists with this username");
  }
  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    username,
  });
  // Check if user was created
  if (user) {
    // Return user data and token if user was created
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
    // Return error if user was not created
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Check if user provided with correct data
  if (!email || !password) {
    res.status(400);
    throw new Error("Not valid data");
  }
  // Check if user exists and password matches
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    // Return user data and token if user exists and password matches
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
    // Return error if user does not exist or password does not match
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  // Clear cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  // Return success message
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Return user data
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
  // Check if user provided at least one field to update
  if (
    !req.body.name &&
    !req.body.email &&
    !req.body.username &&
    !req.body.password
  ) {
    res.status(400);
    throw new Error("Not valid data");
  }
  // Update user data if provided
  req.user.name = req.body.name || req.user.name;
  req.user.email = req.body.email || req.user.email;
  req.user.username = req.body.username || req.user.username;
  if (req.body.password) {
    req.user.password = req.body.password;
  }
  //Handle the image upload if the user provided one
  let oldImageName;
  let newImageName;
  if (req.file) {
    const oldImageUrl = req.user.profile_image;
    oldImageName = oldImageUrl.substring(oldImageUrl.lastIndexOf("/") + 1);
    newImageName =
      oldImageName === "default"
        ? `${req.user._id}_1`
        : oldImageName.slice(0, -1) + (parseInt(oldImageName.slice(-1)) + 1);
    try {
      // Upload the new image
      req.user.profile_image = await uploadFileToBlob(
        req.file,
        "profile_images",
        newImageName
      );
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image.");
    }
  }
  // Save updated user data
  const updatedUser = await req.user.save();
  // Return updated user data
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
  // Check if user_id is castable to ObjectId
  if (!req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  // Find user
  const user = await User.findById(req.params.user_id);
  // Check if user exists
  if (user) {
    // Return user data if user exists
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
    // Return error if user does not exist
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    List user families
// @route   GET /api/users/families
// @access  Private
const getUserFamilies = asyncHandler(async (req, res) => {
  // Find families where user is a member
  const families = await Family.find({ members: req.user._id });
  // Return families data
  res.status(200).json({ families });
});

// @desc    List user recipes
// @route   GET /api/users/recipes
// @access  Private
const getUserRecipes = asyncHandler(async (req, res) => {
  // Find recipes where user is the author
  const recipes = await Recipe.find({ author_id: req.user._id });
  // Return recipes data
  res.status(200).json({ recipes });
});

// @desc    Delete User
// @route   DELETE /api/users/
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  // Delete user recipes
  await Recipe.deleteMany({ author_id: req.user._id });
  // Delete invites where user is invited or inviter
  await Invite.deleteMany({
    $or: [{ invited_user_id: req.user._id }, { inviter_user_id: req.user._id }],
  });
  // Delete user from families, if user is last admin, delete family
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
  // Delete user
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
