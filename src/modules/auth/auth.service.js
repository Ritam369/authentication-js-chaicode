import crypto from "crypto"
import ApiError from "../../common/utils/api-error.js";
import { generateResetToken, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js"

const hashCreation = (pass) =>
  crypto.createHash("sha256").update(pass).digest("hex");

const register = async ({ fname, lname, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email already exisits");

  const { rawToken, hashedToken } = generateResetToken();

  const newPassword = hashCreation(password);

  const user = await User.create({
    fname,
    lname,
    email,
    password: newPassword,
    role,
    verificationToken: hashedToken,
  });

  // TODO: send an email to user with token: rawToken

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const hashedPassword = hashCreation(password);

  const isMatch = hashedPassword === user.password;
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

//   if (!user.isVerified) {
//     throw ApiError.forbidden("Please verify your email before logging in");
//   }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Store hashed refresh token in DB so it can be invalidated on logout
  user.refreshToken = hashCreation(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

export { register, login }