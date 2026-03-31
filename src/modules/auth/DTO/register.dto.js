import BaseDTO from "../../../common/DTO/base.dto.js";
import Joi from "joi";

class RegisterDto extends BaseDTO{
    static schema = Joi.object({
        fname: Joi.string().trim().min(2).max(40).required(),
        lname: Joi.string().trim().min(2).max(40),
        email: Joi.string().email().max(322).lowercase().required(),
        password: Joi.string().min(8).message("Password must contain 8 chars minimum").max(66).required(),
        role: Joi.string().valid("user", "admin").default("user")
    })
}

export default RegisterDto