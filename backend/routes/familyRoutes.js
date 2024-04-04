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

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.route("/").post(protect, createFamily);
router.route("/recipes").get(protect, listAllFamiliesRecipes);
router.route("/:family_id").get(protect, familyUser, getFamilyById);
router
  .route("/:family_id")
  .put(protect, familyAdmin, modifyFamily)
  .delete(protect, familyAdmin, deleteFamily);
router.route("/:family_id/members").get(protect, familyUser, listMembers);
router
  .route("/:family_id/members/:user_id")
  .delete(protect, familyAdmin, removeMember);
router.route("/:family_id/recipes").get(protect, familyUser, listRecipes);
router.route("/:family_id/leave").delete(protect, familyUser, leaveFamily);
router
  .route("/:family_id/admins/:user_id")
  .post(protect, familyAdmin, addAdmin)
  .delete(protect, familyAdmin, removeAdmin);

export default router;
