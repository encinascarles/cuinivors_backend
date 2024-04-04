import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";
import Recipe from "../models/recipeModel.js";

// @desc    Create family
// @route   POST /api/families
// @access  Private
const createFamily = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //check if user provided with correct data
  if (!name || !description) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //handle image upload
  let family_image = "/defaultfamilyimage";
  if (req.file) {
    try {
      family_image = await uploadFileToBlob(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image");
    }
  }
  //create family
  const family = await Family.create({
    name,
    description,
    family_image,
    members: [req.user._id],
    admins: [req.user._id],
  });
  //Check if it was created and return it
  if (family) {
    res.status(201).json({
      family: {
        _id: family._id,
        name: family.name,
        description: family.description,
        family_image: family.image,
        members: family.members,
        admins: family.admins,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid family data");
  }
});

// @desc    Get family by ID
// @route   GET /api/families/:family_id
// @access  Private, familyUser
const getFamilyById = asyncHandler(async (req, res) => {
  res.json({
    family: {
      _id: req.family._id,
      name: req.family.name,
      description: req.family.description,
      family_image: req.family.family_image,
      members: req.family.members,
      invites: req.family.invites,
    },
  });
});

// @desc    Modify family
// @route   PUT /api/families/:family_id
// @access  Private, familyAdmin
const modifyFamily = asyncHandler(async (req, res) => {
  //edit family name and description
  req.family.name = req.body.name || req.family.name;
  req.family.description = req.body.description || req.family.description;
  //handle image upload
  if (req.file) {
    let imageUrl = "";
    try {
      imageUrl = await uploadFileToBlob(req.file);
      req.family.image = imageUrl;
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image");
    }
  }
  //save changes
  const updatedFamily = await req.family.save();
  //return updated family
  res.json({
    message: "Family updated",
    family: {
      _id: updatedFamily._id,
      name: updatedFamily.name,
      description: updatedFamily.description,
      family_image: updatedFamily.family_image,
      members: updatedFamily.members,
      admins: updatedFamily.admins,
    },
  });
});

// @desc    List all family members
// @route   GET /api/families/:family_id/members
// @access  Private, familyUser
const listMembers = asyncHandler(async (req, res) => {
  //list all members with user info
  const members = await Promise.all(
    req.family.members.map(async (member) => {
      const user = await User.findById(member);
      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
        admin: member.admin,
      };
    })
  );
  res.json({ members });
});

// @desc    Remove member from family
// @route   DELETE /api/families/:family_id/members/:user_id
// @access  Private, familyAdmin
const removeMember = asyncHandler(async (req, res) => {
  //check if user_id is castable to ObjectId
  if (!req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  //find family
  //check if user is trying to remove himself
  if (req.user._id.toString() === req.params.user_id.toString()) {
    res.status(400);
    throw new Error("Cannot remove yourself");
  }
  //remove member from family model
  req.family.members = req.family.members.filter(
    (member) => member.toString() !== req.params.user_id.toString()
  );
  req.family.admins = req.family.admins.filter(
    (admin) => admin.toString() !== req.params.user_id.toString()
  );
  await req.family.save();
  res.json({ message: "Member removed from family" });
});

// @desc    List family recipes
// @route   GET /api/families/:family_id/recipes
// @access  Private, familyUser
const listRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ author_id: { $in: req.family.members } });
  const recipesToSend = await Promise.all(
    recipes.map(async (recipe) => {
      const user = await User.findById(recipe.author_id);
      return {
        _id: recipe._id,
        name: recipe.name,
        prep_time: recipe.prep_time,
        total_time: recipe.total_time,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        recommendations: recipe.recommendations,
        origin: recipe.origin,
        recipe_image: recipe.recipe_image,
        author: user.username,
      };
    })
  );
  res.json({ recipes: recipesToSend });
});

// @desc    List all user families recipes
// @route   GET /api/families/recipes
// @access  Private
const listAllFamiliesRecipes = asyncHandler(async (req, res) => {
  const families = await Family.find({ members: req.user._id });
  const familyMembers = [].concat(...families.map((family) => family.members));
  const recipes = await Recipe.find({
    author_id: { $in: familyMembers },
  });
  const recipesToSend = await Promise.all(
    recipes.map(async (recipe) => {
      const user = await User.findById(recipe.author_id);
      return {
        _id: recipe._id,
        name: recipe.name,
        prep_time: recipe.prep_time,
        total_time: recipe.total_time,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        recommendations: recipe.recommendations,
        origin: recipe.origin,
        recipe_image: recipe.recipe_image,
        author: user.username,
      };
    })
  );
  res.json({ recipes: recipesToSend });
});

// @desc    Leave family
// @route   POST /api/families/:family_id/leave
// @access  Private, familyUser
const leaveFamily = asyncHandler(async (req, res) => {
  //check if user is the last admin
  if (
    req.family.admins[0].toString() === req.user._id.toString() &&
    req.family.admins.length === 1
  ) {
    res.status(400);
    throw new Error("Cannot leave as last admin");
  }
  //remove member from family model
  req.family.members = req.family.members.filter(
    (member) => member.toString() !== req.user._id.toString()
  );
  req.family.admins = req.family.admins.filter(
    (admin) => admin.toString() !== req.user._id.toString()
  );
  await req.family.save();
  res.json({ message: "Left family" });
});

// @desc    Add an admin to family
// @route   POST /api/families/:family_id/admins/:user_id
// @access  Private, familyAdmin
const addAdmin = asyncHandler(async (req, res) => {
  //check if user_id is castable to ObjectId
  if (!req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  //check if user exists
  const user = await User.findById(req.params.user_id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  //check if user is a member of the family
  if (!req.family.members.includes(req.params.user_id)) {
    res.status(400);
    throw new Error("User is not a member of the family");
  }
  //check if user is already an admin
  if (req.family.admins.includes(req.params.user_id)) {
    res.status(400);
    throw new Error("User is already an admin");
  }
  //add user to admins
  req.family.admins.push(req.params.user_id);
  await req.family.save();
  res.json({ message: "Admin added" });
});

// @desc    Remove an admin from family
// @route   DELETE /api/families/:family_id/admins/:user_id
// @access  Private, familyAdmin
const removeAdmin = asyncHandler(async (req, res) => {
  //check if user_id is castable to ObjectId
  if (!req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  //check if user exists
  const user = await User.findById(req.params.user_id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  //check if user is the last admin
  if (
    req.family.admins[0].toString() === req.params.user_id.toString() &&
    req.family.admins.length === 1
  ) {
    res.status(400);
    throw new Error("Cannot remove last admin");
  }
  //remove user from admins
  req.family.admins = req.family.admins.filter(
    (admin) => admin.toString() !== req.params.user_id.toString()
  );
  await req.family.save();
  res.json({ message: "Admin removed" });
});

// @desc    Delete family
// @route   DELETE /api/families/:family_id
// @access  Private, familyAdmin
const deleteFamily = asyncHandler(async (req, res) => {
  const family = await Family.findByIdAndDelete(req.params.family_id);
  if (family) {
    res.json({ message: "Family deleted" });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

export {
  createFamily,
  getFamilyById,
  modifyFamily,
  listMembers,
  removeMember,
  listRecipes,
  listAllFamiliesRecipes,
  leaveFamily,
  addAdmin,
  removeAdmin,
  deleteFamily,
};
