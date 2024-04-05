import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";

// @desc    Create invite
// @route   POST /api/invites
// @access  Private
const createInvite = asyncHandler(async (req, res) => {
  const { family_id, invited_username } = req.body;
  // Check if user provided the required data
  if (!family_id || !invited_username) {
    res.status(400);
    throw new Error("Not valid data");
  }
  // Check if family_id is castable to ObjectId
  if (!family_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  // Find user
  const user = await User.findOne({ username: invited_username });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Find family
  const family = await Family.findById(family_id);
  if (!family) {
    res.status(404);
    throw new Error("Family not found");
  }
  // Check if user is already in family
  if (family.members.includes(user._id)) {
    res.status(400);
    throw new Error("User is already in family");
  }
  // Check if user has already been invited
  const alreadyInvited = await Invite.findOne({
    family_id,
    invited_user_id: user._id,
  });
  if (alreadyInvited) {
    res.status(400);
    throw new Error("User has already been invited");
  }
  // Create invite
  const invite = await Invite.create({
    family_id,
    invited_user_id: user._id,
    inviter_user_id: req.user._id,
  });
  // Return invite
  res.status(201).json({
    message: "Invite created",
    invite: {
      _id: invite._id,
      family_id: invite.family_id,
      invited_user_id: invite.invited_user_id,
      inviter_user_id: invite.inviter_user_id,
    },
  });
});

// @desc    List user invites
// @route   GET /api/invites
// @access  Private
const listInvites = asyncHandler(async (req, res) => {
  // Find invites where user is invited
  const invites = await Invite.find({ invited_user_id: req.user._id });
  // Return invites
  res.json({ invites });
});

// @desc    Accept invite
// @route   POST /api/invites/:invite_id/accept
// @access  Private
const acceptInvite = asyncHandler(async (req, res) => {
  // Check if invite_id is castable to ObjectId
  if (!req.params.invite_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  // Find invite
  const invite = await Invite.findById(req.params.invite_id);
  if (!invite) {
    res.status(404);
    throw new Error("Invite not found");
  }
  // Check if user is the invited user
  if (invite.invited_user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }
  // Find family
  const family = await Family.findById(invite.family_id);
  if (!family) {
    res.status(404);
    throw new Error("Family not found");
  }
  // Add user to family
  family.members.push(req.user._id);
  await family.save();
  // Remove invite
  await invite.deleteOne({ _id: req.params.invite_id });
  // Return success message
  res.status(200).json({ message: "Invite accepted" });
});

// @desc    Decline invite
// @route   POST /api/invites/:invite_id/decline
// @access  Private
const declineInvite = asyncHandler(async (req, res) => {
  // Check if invite_id is castable to ObjectId
  if (!req.params.invite_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  // Find invite
  const invite = await Invite.findById(req.params.invite_id);
  if (!invite) {
    res.status(404);
    throw new Error("Invite not found");
  }
  // Check if user is the invited user
  if (invite.invited_user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }
  // Remove invite
  await invite.deleteOne({ _id: req.params.invite_id });
  // Return success message
  res.json({ message: "Invite declined" });
});

export { createInvite, listInvites, acceptInvite, declineInvite };
