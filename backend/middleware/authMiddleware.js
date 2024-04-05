import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  // Grab token from cookies
  const token = req.cookies.jwt;
  // Check if token exists
  if (token) {
    try {
      // Verify token (decode it)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find user by id and remove password from response
      req.user = await User.findById(decoded.user_id).select("-password");
      // Check if user exists
      if (!req.user) {
        res.status(404);
        throw new Error("User not found");
      }
      next();
    } catch (error) {
      // Return error if token is invalid
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    // Return error if token does not exist
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
