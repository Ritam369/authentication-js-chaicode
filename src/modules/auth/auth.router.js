import {Router} from "express";
import validate from "../../common/Middleware/validate.middleware.js";
import RegisterDto from "./DTO/register.dto.js";
import controller from "./auth.controller.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
export default router;