const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const AppError = require("./../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

exports.uploadCoverImage = upload.single("coverImage");

exports.resizeCoverImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `img-${Math.random() * 2}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/${req.file.filename}`);

    next();
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find().populate("author");
    if (!blogs) {
        return next(new AppError("Could not find any blog", 401));
    }
    return res.status(200).json({
        status: "success",
        message: "Blog fetched successfully",
        data: {
            blogs,
        },
    });
});

exports.getBlogById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate("author").populate("reviews");

    if (!blog) {
        return next(new AppError("Blog not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            blog,
        },
    });
});

exports.getBlogsByAuthor = catchAsync(async (req, res, next) => {
    const { authorId } = req.params;

    const blogs = await Blog.find({ author: authorId })
        .sort({ created_at: -1 })
        .limit(3);

    res.status(200).json({
        status: "success",
        data: {
            blogs,
        },
    });
});

exports.getBlogsByUser = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({ author: req.user.id });
    if (req.params.id !== req.user.id) {
        return next(new AppError("Unauthorized access to user's blogs", 403));
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Blogs fetches succesfully",
            blogs,
        },
    });
});

exports.postBlog = catchAsync(async (req, res, next) => {
    const { title, content, summary, category } = req.body;
    const coverImage = req.file.filename;
    if (!title || !content || !summary || !category) {
        return next(
            new AppError(
                "Please provide all necssary information to create a blog",
                400
            )
        );
    }
    const newBlog = await Blog.create({
        title,
        content,
        summary,
        coverImage,
        category,
        author: req.user.id,
    });

    return res.status(201).json({
        status: "success",
        data: {
            message: "Blog has been created successfully",
        },
    });
});
exports.editBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, content, summary, category } = req.body;
    let coverImage;

    if (req.file) {
        coverImage = req.file.filename;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { title, content, summary, coverImage, category },
        {
            new: true,
        }
    );

    if (!updatedBlog) {
        return next(new AppError("Blog post not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            message: "Blog post updated successfully",
            blog: updatedBlog,
        },
    });
});

exports.getBlogsByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;

    const blogs = await Blog.find({ category })
        .sort({ created_at: -1 })
        .populate("author")
        .exec();

    if (blogs.length === 0) {
        return next(new AppError("No blogs found in this category", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            blogs,
        },
    });
});

exports.getAuthorDetails = catchAsync(async (req, res, next) => {
    const { authorId } = req.params;
    const author = await User.findById(authorId);
    if (!author) {
        return next(new AppError("Author not found", 404));
    }

    const blogs = await Blog.find({ author: authorId }).populate("author");

    res.status(200).json({
        status: "success",
        data: {
            author,
            blogs,
        },
    });
});
