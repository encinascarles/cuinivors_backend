import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  //grab token from cookies
  const token = req.cookies.jwt;
  if (token) {
    try {
      //verify token (decode it)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //find user by id and remove password from response
      req.user = await User.findById(decoded.user_id).select("-password");
      //check if user exists
      if (!req.user) {
        res.status(404);
        throw new Error("User not found");
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
