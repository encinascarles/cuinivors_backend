import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";

const familyAdmin = asyncHandler(async (req, res, next) => {
  //check if family_id is castable to ObjectId
  if (!req.params.family_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  //find family
  const family = await Family.findById(req.params.family_id);
  if (family) {
    const user_admin = family.admins.find(
      (admin) => admin.toString() === req.user._id.toString()
    );
    if (user_admin) {
      req.family = family;
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
  //check if family_id is castable to ObjectId
  if (!req.params.family_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Not valid id");
  }
  //find family
  const family = await Family.findById(req.params.family_id);
  if (family) {
    const user = family.members.find(
      (member) => member.toString() === req.user._id.toString()
    );
    if (user) {
      req.family = family;
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
