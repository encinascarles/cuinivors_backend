import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";
import User from "../models/userModel.js";
import { uploadFileToBlob } from "../utils/uploadFileToBlob.js";

// @desc    Create family
// @route   POST /api/families
// @access  Private
const createFamily = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!req.file) {
    return res.status(400).send("Archivo no encontrado para subir.");
  }

  let imageUrl = "";

  try {
    imageUrl = await uploadFileToBlob(req.file);
  } catch (error) {
    res.status(500).send("Error al subir la imagen.");
    return;
  }

  const family = await Family.create({
    name,
    description,
    image: imageUrl,
    members: [{ user_id: req.user._id, admin: true }],
    invites: [],
  });

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
    throw new Error("Datos de familia inválidos");
  }
});

// @desc    Get family by ID
// @route   GET /api/families/:id
// @access  Private
const getFamilyById = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);

  if (family) {
    res.json(family);
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Modify family
// @route   PUT /api/families/:id
// @access  Private
const modifyFamily = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);

  if (family) {
    family.name = req.body.name || family.name;
    family.description = req.body.description || family.description;

    if (req.file) {
      let imageUrl = "";

      try {
        imageUrl = await uploadFileToBlob(req.file);
        family.image = imageUrl;
      } catch (error) {
        res.status(500).send("Error al subir la imagen.");
        return;
      }
    }

    const updatedFamily = await family.save();

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
    throw new Error("Familia no encontrada");
  }
});

// @desc    Invite people
// @route   POST /api/families/addinvite/:id
// @access  Private
const addInvite = asyncHandler(async (req, res) => {
  const { id: family_id } = req.params;
  const { user_id } = req.body;

  const family = await Family.findById(family_id);

  if (family) {
    if (family.invites.includes(user_id)) {
      res.status(400);
      throw new Error("User already invited");
    }
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    family.invites.push(user_id);
    await family.save();
    //Add invite to user model
    user.invites.push({ family_id, user_id: req.user._id });
    await user.save();
    res.json({ message: "Invite sent" });
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

// @desc    Remove invitation
// @route   POST /api/families/removeinvite/:id
// @access  Private
const removeInvite = asyncHandler(async (req, res) => {
  const { id: family_id } = req.params;
  const { user_id } = req.body;

  const family = await Family.findById(family_id);

  if (family) {
    if (!family.invites.includes(user_id)) {
      res.status(400);
      throw new Error("User not invited");
    }
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
// @access  Private
const deleteFamily = asyncHandler(async (req, res) => {
  const family = await Family.findByIdAndDelete(req.params.id);

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
  addInvite,
  removeInvite,
  deleteFamily,
};
