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
  res.json(req.family);
});

// @desc    Modify family
// @route   PUT /api/families/:id
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
    _id: updatedFamily._id,
    name: updatedFamily.name,
    description: updatedFamily.description,
    image: updatedFamily.image,
    members: updatedFamily.members,
    invites: updatedFamily.invites,
  });
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
  //check if user is already invited:
  if (req.family.invites.includes(user_id)) {
    res.status(400);
    throw new Error("User already invited");
  }
  //check if user is already part of the family:
  const member = req.family.members.find((member) => member.user_id == user_id);
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
  req.family.invites.push(user_id);
  await req.family.save();
  //Add invite to user model
  user.invites.push({ family_id, inviter_id: req.user._id });
  await user.save();
  res.json({ message: "Invite sent" });
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
  //check if user is invited
  if (!req.family.invites.includes(user_id)) {
    res.status(400);
    throw new Error("User not invited");
  }
  //Remove invite from family model
  req.family.invites = req.family.invites.filter(
    (id) => id.toString() !== user_id.toString()
  );
  await req.family.save();
  //Remove invite from user model
  const user = await User.findById(user_id);
  user.invites = user.invites.filter(
    (invite) => invite.family_id.toString() !== family_id.toString()
  );
  await user.save();
  res.json({ message: "Invite removed" });
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
  //check if user is part of the family
  const member = req.family.members.find(
    (member) => member.user_id.toString() == user_id
  );
  if (!member) {
    res.status(400);
    throw new Error("User not in family");
  }
  //check if user is the last admin
  if (member.admin && req.family.members.length === 1) {
    res.status(400);
    throw new Error("Cannot remove last admin");
  }
  //Remove member from family model
  req.family.members = req.family.members.filter(
    (member) => member.user_id.toString() != user_id
  );
  await req.family.save();
  res.json({ message: "Member removed" });
});

// @desc    Leave family
// @route   POST /api/families/leave/:id
// @access  Private, familyUser
const leaveFamily = asyncHandler(async (req, res) => {
  const { id: family_id } = req.params;

  //check if user provided with correct data
  if (!family_id) {
    res.status(400);
    throw new Error("Not valid data");
  }
  //check if user is the last admin
  const admins = req.family.members.filter((member) => member.admin);
  if (req.family_admin && admins.length === 1) {
    res.status(400);
    throw new Error("Cannot leave as last admin");
  }
  //Remove member from family model
  family.members = family.members.filter(
    (member) => member.user_id.toString() != req.user._id.toString()
  );
  await family.save();
  res.json({ message: "Left family" });
});

export {
  createFamily,
  getFamilyById,
  modifyFamily,
  addInvite,
  removeInvite,
  deleteFamily,
  removeMember,
  leaveFamily,
};
