import { Router } from "express";
import { submitMessage, getMessages, deleteMessage } from "../controllers/messages";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.post("/", submitMessage);                       
router.get("/", protectAdmin, getMessages);            
router.delete("/:id", protectAdmin, deleteMessage);  

export default router;
