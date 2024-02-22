const Archive = require("../models/archiveModel");
const Blog = require("../models/blogModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getArchivedBlogs = catchAsync(async (req, res, next) => {
    const archivedBlogs = await Archive.find({ user: req.user.id }).populate(
        "blog"
    );

    if (!archivedBlogs) {
        return next(
            new AppError("You currently don't have an archived blog", 404)
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Archived blogs",
            archivedBlogs,
        },
    });
});

exports.archiveBlog = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
        return next(new AppError("Blog not found", 404));
    }

    const existingArchive = await Archive.findOne({
        blog: blogId,
        user: userId,
    });

    if (existingArchive) {
        return next(new AppError("This blog is already archived by you", 400));
    }

    await Archive.create({ blog: blogId, user: userId });

    res.status(200).json({
        status: "success",
        data: { message: "Blog archived successfully" },
    });
});

exports.unarchiveBlog = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
        return next(new AppError("Blog not found", 404));
    }

    await Archive.findOneAndDelete({ blog: blogId, user: userId });

    res.status(200).json({
        status: "success",
        data: { message: "Blog unarchived successfully" },
    });
});

exports.fetchBlogArchiveStatus = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;
    const userId = req.user.id;

    const archive = await Archive.findOne({ blog: blogId, user: userId });

    if (!archive) {
        res.status(200).json({
            status: "success",
            data: { archived: false },
        });
    } else {
        res.status(200).json({
            status: "success",
            data: { archived: true },
        });
    }
});
