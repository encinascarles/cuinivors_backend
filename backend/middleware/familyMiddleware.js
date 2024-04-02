import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";

const familyAdmin = asyncHandler(async (req, res, next) => {
  const family = await Family.findById(req.params.family_id);
  if (family) {
    const user = family.members.find(
      (member) => member.user_id.toString() === req.user._id.toString()
    );
    if (user && user.admin) {
      req.family = family;
      req.family_admin = true;
      next();
    } else {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

const familyUser = asyncHandler(async (req, res, next) => {
  const family = await Family.findById(req.params.family_id);
  if (family) {
    const user = family.members.find(
      (member) => member.user_id.toString() === req.user._id.toString()
    );
    if (user) {
      req.family = family;
      req.family_admin = user.admin;
      next();
    } else {
      res.status(403);
      throw new Error("Not authorized as a member of this family");
    }
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

export { familyAdmin, familyUser };
