import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import ApiError from "../../common/utils/api-error.js";

const register = async (req, res) => {
  try {
    const user = await authService.register(req.validatedData);
    return ApiResponse.created(
      res,
      "Registration successful. Please verify your email.",
      user,
    );
  } catch (error) {
    throw ApiError.serverError("Failed to register user");
  }
};

const login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.validatedData,
    );

    // Refresh token goes in httpOnly cookie — not accessible to JS
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.ok(res, "User logged in successfully", {user, accessToken})
  } catch (error) {
    throw ApiError.unauthorized("Invalid email or password");
  }
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  ApiResponse.ok(res, "Logged out successfully");
};

const verifyEmail = async (req, res) => {
  await authService.verifyEmail(req.params.token);
  ApiResponse.ok(res, "Email verified successfully");
};

const controller = {
  register,
  login,
  logout,
  verifyEmail
};

export default controller;
