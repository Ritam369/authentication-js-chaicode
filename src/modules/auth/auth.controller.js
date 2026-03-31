import * as authService from "./auth.service.js"
import ApiResponse from "../../common/utils/api-response.js"
import ApiError from "../../common/utils/api-error.js"

const register = async (req, res) => {
    try {
        const user = await authService.register(req.validatedData)
        return ApiResponse.created(res, "User registered successfully", user)
    } catch (error) {
        return ApiError.serverError("Failed to register user")
    }
}

const controller = {
    register
}

export default controller