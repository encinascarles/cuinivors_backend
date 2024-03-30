import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

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
  let imageUrl = "/defaultfamilyimage";
  if (req.file) {
    try {
      imageUrl = await uploadFileToBlob(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image");
    }
  }
  //create family
  const family = await Family.create({
    name,
    description,
    image: imageUrl,
    members: [{ user_id: req.user._id, admin: true }],
    invites: [],
  });
  //Check if it was created and return it
  if (family) {
    res.status(201).json({
      _id: family._id,
      name: family.name,
      description: family.description,
      image: family.image,
      members: family.members,
      invites: family.invites,
    });
  } else {
    res.status(400);
    throw new Error("Invalid family data");
  }
});

// @desc    Get family by ID
// @route   GET /api/families/:id
// @access  Private, familyUser
const getFamilyById = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);
  //Check if family exists and return it
  if (family) {
    res.json(family);
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Modify family
// @route   PUT /api/families/:id
// @access  Private, familyAdmin
const modifyFamily = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);
  //Check if family exists
  if (family) {
    //edit family name and description
    family.name = req.body.name || family.name;
    family.description = req.body.description || family.description;
    //handle image upload
    if (req.file) {
      let imageUrl = "";
      try {
        imageUrl = await uploadFileToBlob(req.file);
        family.image = imageUrl;
      } catch (error) {
        res.status(500);
        throw new Error("Error uploading image");
      }
    }
    //save changes
    const updatedFamily = await family.save();
    //return updated family
    res.json({
      _id: updatedFamily._id,
      name: updatedFamily.name,
      description: updatedFamily.description,
      image: updatedFamily.image,
      members: updatedFamily.members,
      invites: updatedFamily.invites,
    });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Invite people
// @route   POST /api/families/addinvite/:id
// @access  Private, familyAdmin
const addInvite = asyncHandler(async (req, res) => {
  const { id: family_id } = req.params;
  const { user_id } = req.body;
  //check if user provided with correct data
  if (!user_id || !family_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if family exists
  const family = await Family.findById(family_id);
  if (family) {
    //check if user is already invited:
    if (family.invites.includes(user_id)) {
      res.status(400);
      throw new Error("User already invited");
    }
    //check if user is already part of the family:
    const member = family.members.find((member) => member.user_id == user_id);
    if (member) {
      res.status(400);
      throw new Error("User already in family");
    }
    //check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    //Add invite to family model
    family.invites.push(user_id);
    await family.save();
    //Add invite to user model
    user.invites.push({ family_id, inviter_id: req.user._id });
    await user.save();
    res.json({ message: "Invite sent" });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Remove invitation
// @route   POST /api/families/removeinvite/:id
// @access  Private, familyAdmin
const removeInvite = asyncHandler(async (req, res) => {
  const { id: family_id } = req.params;
  const { user_id } = req.body;
  //check if user provided with correct data
  if (!user_id || !family_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if family exists
  const family = await Family.findById(family_id);
  if (family) {
    //check if user is invited
    if (!family.invites.includes(user_id)) {
      res.status(400);
      throw new Error("User not invited");
    }
    //Remove invite from family model
    family.invites = family.invites.filter((id) => id !== user_id);
    await family.save();
    //Remove invite from user model
    const user = await User.findById(user_id);
    user.invites = user.invites.filter((id) => id !== family_id);
    await user.save();
    res.json({ message: "Invite removed" });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Delete family
// @route   DELETE /api/families/:id
// @access  Private, familyAdmin
const deleteFamily = asyncHandler(async (req, res) => {
  const family = await Family.findByIdAndDelete(req.params.id);
  if (family) {
    res.json({ message: "Family deleted" });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Remove member from family
// @route   POST /api/families/removemember/:id
// @access  Private, familyAdmin
const removeMember = asyncHandler(async (req, res) => {
  const { id: family_id } = req.params;
  const { user_id } = req.body;
  //check if user provided with correct data
  if (!user_id || !family_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if family exists
  const family = await Family.findById(family_id);
  if (family) {
    //check if user is part of the family
    const member = family.members.find((member) => member.user_id == user_id);
    if (!member) {
      res.status(400);
      throw new Error("User not in family");
    }
    //check if user is the last admin
    if (member.admin && family.members.length === 1) {
      res.status(400);
      throw new Error("Cannot remove last admin");
    }
    //Remove member from family model
    family.members = family.members.filter(
      (member) => member.user_id != user_id
    );
    await family.save();
    //Remove family from user model
    const user = await User.findById(user_id);
    user.families = user.families.filter((id) => id !== family_id);
    await user.save();
    res.json({ message: "Member removed" });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

export {
  createFamily,
  getFamilyById,
  modifyFamily,
  addInvite,
  removeInvite,
  deleteFamily,
  removeMember,
};
