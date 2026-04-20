import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 40,
        required: [true, "First name is required"]
    },
    lname: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 40,
        
    },
    email: {
        type: String,
        maxLength: 322,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        trim: true,
        minLength: 8,
        maxLength: 66,
        required: [true, "Password is required"],
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {type: String, select: false},
    refreshToken: {type: String, select: false},
    resetPasswordtoken: {type: String, select: false},
    resetpasswordExpires: {type: Date, select: false},
},{timestamps: true});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema)