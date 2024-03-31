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
router.get("/:id", protect, familyUser, getFamilyById);
router.put("/:id", protect, familyAdmin, upload.single("image"), modifyFamily);
router.post("/addinvite/:id", protect, familyAdmin, addInvite);
router.post("/removeinvite/:id", protect, familyAdmin, removeInvite);
router.delete("/:id", protect, familyAdmin, deleteFamily);
router.post("/removemember/:id", protect, familyAdmin, removeMember);
router.post("/leave/:id", protect, familyUser, leaveFamily);

export default router;
