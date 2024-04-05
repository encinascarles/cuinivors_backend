import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  // Validate user data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error("Not valid data");
  }
  next();
};

export { validateRequest };
