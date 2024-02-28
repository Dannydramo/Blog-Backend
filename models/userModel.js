const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        min: 6,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm Password is required"],
        min: 6,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Password must be the same with Confirm Password",
        },
    },
    photo: {
        type: String,
        default:
            "https://res.cloudinary.com/deynfuln8/image/upload/v1709133978/noprofile_ofb5gn.jpg",
    },
    description: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: null,
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = function (
    candidatePassword,
    userPassword
) {
    return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeAt = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimeAt;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
