const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getUserDetails = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError("No user found", 404));
    }
    user.password = undefined;
    user.confirmPassword = undefined;
    res.status(200).json({
        status: "success",
        data: {
            message: "User details",
            user,
        },
    });
});

exports.updateDetails = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(
            new AppError("This is not the route for updating passsword", 400)
        );
    }

    const filteredBody = filterObj(req.body, "name", "email");
    filteredBody.photo = req.body.photo;
    filteredBody.description = req.body.description;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            message: "Updated successfully",
            user: updatedUser,
        },
    });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(200).json({
        status: "success",
        data: null,
    });
});
