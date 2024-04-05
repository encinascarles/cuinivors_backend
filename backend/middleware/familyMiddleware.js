import asyncHandler from "express-async-handler";
import Family from "../models/familyModel.js";

const familyAdmin = asyncHandler(async (req, res, next) => {
  // Find family
  const family = await Family.findById(req.params.family_id);
  // Check if family exists
  if (family) {
    // Check if user is an admin of the family
    const user_admin = family.admins.find(
      (admin) => admin.toString() === req.user._id.toString()
    );
    if (user_admin) {
      // Set family data to request and continue if user is an admin
      req.family = family;
      next();
    } else {
      // Return error if user is not an admin
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
  } else {
    // Return error if family does not exist
    res.status(404);
    throw new Error("Family not found");
  }
});

const familyUser = asyncHandler(async (req, res, next) => {
  // Find family
  const family = await Family.findById(req.params.family_id);
  // Check if family exists
  if (family) {
    // Check if user is a member of the family
    const user = family.members.find(
      (member) => member.toString() === req.user._id.toString()
    );
    if (user) {
      // Set family data to request and continue if user is a member
      req.family = family;
      next();
    } else {
      // Return error if user is not a member
      res.status(403);
      throw new Error("Not authorized as a member of this family");
    }
  } else {
    // Return error if family does not exist
    res.status(404);
    throw new Error("Family not found");
  }
});

export { familyAdmin, familyUser };
