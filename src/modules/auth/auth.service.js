import crypto from "crypto"
import ApiError from "../../common/utils/api-error.js";
import { generateResetToken } from "../../common/utils/jwt.utils.js";
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

export {register}