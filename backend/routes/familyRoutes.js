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
} from "../controllers/familyControllers.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/", protect, upload.single("image"), createFamily);
router.get("/:id", protect, getFamilyById);
router.put("/:id", protect, upload.single("image"), modifyFamily);
router.post("/addinvite/:id", protect, addInvite);
router.post("/removeinvite/:id", protect, removeInvite);
router.delete("/:id", protect, deleteFamily);

export default router;
