import Joi from "joi";
import BaseDto from "../../../common/DTO/base.dto.js";

class LoginDto extends BaseDto{
    static schema = Joi.object({
        email: Joi.string().email().lowercase().max(322).required(),
        password: Joi.string().min(8).max(66).required()
    })
}

export default LoginDto;