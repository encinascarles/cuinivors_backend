import express from "express";
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  getUserProfileById,
  getUserFamilies,
  getUserRecipes,
  updateUserProfile,
  deleteUser,
} from "../controllers/userControllers.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validationMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const userRegisterValidation = [
  body("name").not().isEmpty(),
  body("username").not().isEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
];
const userLoginValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
];
const userUpdateValidation = [
  body("name").optional().not().isEmpty(),
  body("email").optional().isEmail(),
  body("username").optional().not().isEmpty(),
  body("password").optional().isLength({ min: 8 }),
];
const userIdValidation = [param("user_id").isMongoId()];

const router = express.Router();

router.post("/register", userRegisterValidation, validateRequest, registerUser);
router.post("/auth", userLoginValidation, validateRequest, authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    userUpdateValidation,
    validateRequest,
    upload.single("profile_image"),
    updateUserProfile
  );
router.get(
  "/profile/:user_id",
  userIdValidation,
  validateRequest,
  getUserProfileById
);
router.get("/families", protect, getUserFamilies);
router.get("/recipes", protect, getUserRecipes);
router.delete("/", protect, deleteUser);

export default router;
