const catchAsync = require("../utils/catchAsync");
const Blog = require("../models/blogModel");
const Review = require("../models/reviewModel");
const AppError = require("./../utils/appError");

exports.addReview = catchAsync(async (req, res, next) => {
    const { comment } = req.body;
    const { id } = req.params;

    const review = await Review.create({
        user: req.user.id,
        comment,
    });

    const blog = await Blog.findByIdAndUpdate(id, {
        $push: { reviews: review._id },
    });

    if (!blog) {
        return next(new AppError("Blog not found", 404));
    }

    res.status(201).json({
        status: "success",
        data: {
            message: "Review added successfully",
            review,
        },
    });
});

exports.getBlogReviews = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "username",
        },
    });

    if (!blog) {
        return next(new AppError("Blog not found", 404));
    }

    const reviews = blog.reviews;

    res.status(200).json({
        status: "success",
        data: {
            message: "",
            reviews,
        },
    });
});

exports.editReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    if (review.user.toString() !== req.user.id) {
        return next(
            new AppError("You are not authorized to edit this review", 403)
        );
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json({
        status: "success",
        data: {
            review,
        },
    });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    if (review.user.toString() !== req.user.id) {
        return next(
            new AppError("You are not authorized to delete this review", 403)
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            review: null,
            message: "Review deleted succesfully",
        },
    });
});
