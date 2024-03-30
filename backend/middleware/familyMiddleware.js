import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";

const familyAdmin = asyncHandler(async (req, res, next) => {
  const family = await Family.findById(req.params.id);
  if (family) {
    const admin = family.members.find((member) => member.admin === true);
    if (admin.user_id.toString() === req.user._id.toString()) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized as an admin");
    }
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

const familyUser = asyncHandler(async (req, res, next) => {
  const family = await Family.findById(req.params.id);
  if (family) {
    const user = family.members.find(
      (member) => member.user_id.toString() === req.user._id.toString()
    );
    if (user) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized as a member of this family");
    }
  } else {
    res.status(404);
    throw new Error("Family not found");
  }
});

export { familyAdmin, familyUser };
