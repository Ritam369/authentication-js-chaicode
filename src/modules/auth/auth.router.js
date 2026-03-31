import {Router} from "express";
import validate from "../../common/Middleware/validate.middleware.js";
import RegisterDto from "./DTO/register.dto.js";
import controller from "./auth.controller.js";
import LoginDto from "./DTO/login.dto.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
export default router;