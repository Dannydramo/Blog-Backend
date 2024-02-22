const Subscription = require("../models/subscriptionModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.subscribeToBlog = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;
    const userId = req.user.id;

    const existingSubscription = await Subscription.findOne({
        blog: blogId,
        user: userId,
    });

    if (existingSubscription) {
        return next(
            new AppError("You are already subscribed to this blog", 400)
        );
    }

    await Subscription.create({ blog: blogId, user: userId });

    res.status(200).json({
        status: "success",
        message: "Subscribed to the blog successfully",
    });
});

exports.unsubscribeFromBlog = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;
    const userId = req.user.id;

    await Subscription.findOneAndDelete({ blog: blogId, user: userId });

    res.status(200).json({
        status: "success",
        message: "Unsubscribed from the blog successfully",
    });
});

exports.getSubscribersOfBlog = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;

    const subscribers = await Subscription.find({ blog: blogId });

    res.status(200).json({
        status: "success",
        data: {
            subscribers,
        },
    });
});
