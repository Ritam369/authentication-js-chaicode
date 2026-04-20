import crypto from "crypto"
import ApiError from "../../common/utils/api-error.js";
import { generateResetToken, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../common/utils/jwt.utils.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../common/config/email.js";
import User from "./auth.model.js"

const hashToken = (pass) =>
  crypto.createHash("sha256").update(pass).digest("hex");

const register = async ({ fname, lname, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email already exisits");

  const { rawToken, hashedToken } = generateResetToken();

  const user = await User.create({
    fname,
    lname,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });

  // Don't let email failure crash registration — user is already created
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");


  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  if (!user.isVerified) {
    throw ApiError.forbidden("Please verify your email before logging in");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Store hashed refresh token in DB so it can be invalidated on logout
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

const logout = async (userId) => {
  // Clear stored refresh token so it can't be reused
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const verifyEmail = async (token) => {
  const trimmed = String(token).trim();
  if (!trimmed) {
    throw ApiError.badRequest("Invalid or expired verification token");
  }

  // DB stores SHA256(raw). Links / email use the raw token — we hash for lookup.
  // If you paste the hash from MongoDB into Postman, hashing again would not match;
  // so we also try a direct match on the stored value.
  const hashedInput = hashToken(trimmed);
  let user = await User.findOne({ verificationToken: hashedInput }).select(
    "+verificationToken",
  );
  if (!user) {
    user = await User.findOne({ verificationToken: trimmed }).select(
      "+verificationToken",
    );
  }
  if (!user) throw ApiError.badRequest("Invalid or expired verification token");

  await User.findByIdAndUpdate(user._id, {
    $set: { isVerified: true },
    $unset: { verificationToken: 1 },
  });

  return user;
};

export { register, login, logout, verifyEmail }