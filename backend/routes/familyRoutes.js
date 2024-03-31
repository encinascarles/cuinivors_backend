import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  createFamily,
  getFamilyById,
  modifyFamily,
  addInvite,
  removeInvite,
  deleteFamily,
  removeMember,
  leaveFamily,
} from "../controllers/familyControllers.js";
import { familyAdmin, familyUser } from "../middleware/familyMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", protect, upload.single("image"), createFamily);
router.get("/:family_id", protect, familyUser, getFamilyById);
router.put(
  "/:family_id",
  protect,
  familyAdmin,
  upload.single("image"),
  modifyFamily
);
router.post("/addinvite/:family_id", protect, familyAdmin, addInvite);
router.post("/removeinvite/:family_id", protect, familyAdmin, removeInvite);
router.delete("/:family_id", protect, familyAdmin, deleteFamily);
router.post("/removemember/:family_id", protect, familyAdmin, removeMember);
router.post("/leave/:family_id", protect, familyUser, leaveFamily);

export default router;
