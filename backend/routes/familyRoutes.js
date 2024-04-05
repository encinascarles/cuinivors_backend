import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  createFamily,
  getFamilyById,
  modifyFamily,
  listMembers,
  removeMember,
  listRecipes,
  listAllFamiliesRecipes,
  leaveFamily,
  addAdmin,
  removeAdmin,
  deleteFamily,
} from "../controllers/familyControllers.js";
import { familyAdmin, familyUser } from "../middleware/familyMiddleware.js";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validationMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const familyIdValidation = [param("family_id").isMongoId()];
const userIdValidation = [param("user_id").isMongoId()];
const familyCreateValidation = [
  body("name").not().isEmpty(),
  body("description").not().isEmpty(),
];
const familyModifyValidation = [
  body("name").optional().not().isEmpty(),
  body("description").optional().not().isEmpty(),
];

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    familyCreateValidation,
    validateRequest,
    upload.single("family_image"),
    createFamily
  );
router.route("/recipes").get(protect, listAllFamiliesRecipes);
router
  .route("/:family_id")
  .get(protect, familyIdValidation, validateRequest, familyUser, getFamilyById);
router
  .route("/:family_id")
  .put(
    protect,
    familyIdValidation,
    familyModifyValidation,
    validateRequest,
    familyAdmin,
    upload.single("family_image"),
    modifyFamily
  )
  .delete(
    protect,
    familyIdValidation,
    validateRequest,
    familyAdmin,
    deleteFamily
  );
router
  .route("/:family_id/members")
  .get(protect, familyIdValidation, validateRequest, familyUser, listMembers);
router
  .route("/:family_id/members/:user_id")
  .delete(
    protect,
    familyIdValidation,
    userIdValidation,
    validateRequest,
    familyAdmin,
    removeMember
  );
router
  .route("/:family_id/recipes")
  .get(protect, familyIdValidation, validateRequest, familyUser, listRecipes);
router
  .route("/:family_id/leave")
  .delete(
    protect,
    familyIdValidation,
    validateRequest,
    familyUser,
    leaveFamily
  );
router
  .route("/:family_id/admins/:user_id")
  .post(
    protect,
    familyIdValidation,
    userIdValidation,
    validateRequest,
    familyAdmin,
    addAdmin
  )
  .delete(
    protect,
    familyIdValidation,
    userIdValidation,
    validateRequest,
    familyAdmin,
    removeAdmin
  );

export default router;
