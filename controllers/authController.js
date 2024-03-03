const { promisify } = require("util");
const crypto = require("crypto");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signJwt = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
};

const createSendToken = (user, statusCode, res, message) => {
    const token = signJwt(user._id);

    const cookiesOption = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
        ),
        httpOnly: false,
    };

    if (process.env.NODE_ENV === "production") cookiesOption.secure = true;

    res.cookie("token", token, cookiesOption);
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        message,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        username: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    });
    createSendToken(newUser, 201, res, "Account created successfully");
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }
    createSendToken(user, 200, res, "Logged in successfully");
});

// For protecting routes
exports.protect = catchAsync(async (req, res, next) => {
    // 1. Get the token and checks if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new AppError(
                "You are not logged in. Please log in to get access",
                401
            )
        );
    }
    // 2. Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3. Checks if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user does not longer exists", 401));
    }
    // 4. Checks if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed password. Please login again",
                401
            )
        );
    }

    req.user = currentUser;
    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("There is no user with this email", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    let frontendUrl;

    if (process.env.NODE_ENV === "production") {
        frontendUrl = "https://scribbles-snowy.vercel.app";
    } else {
        frontendUrl = "http://localhost:5173";
    }

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
    <p>Forgot your password? Submit a patch request with your new password to the following link:</p>
    <p><a target="_blank" href="${resetUrl}">Reset Password</a></p>
    <p>If you didn't forget your password, please ignore this email.</p>
`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (Valid for 10 minutes)",
            message,
        });
        res.status(200).json({
            status: "success",
            message: "Please check your email for link to reset your password",
        });
    } catch (error) {
        (user.passwordResetToken = undefined),
            (user.passwordResetExpires = undefined);
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                "There was an error sending the email please try again later",
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError("Your current password is wrong", 401));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    createSendToken(user, 200, res, "Password updated sucessfull");
});
