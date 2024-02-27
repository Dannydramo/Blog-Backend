const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blog Title is required"],
    },
    coverImage: {
        type: String,
        required: [true, "Cover Image is required"],
    },
    content: {
        type: String,
        required: [true, "Blog content is required"],
    },
    summary: {
        type: String,
        required: [true, "Blog summary is required"],
    },
    slug: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: [true, "Category is required"],
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: null,
    },
});

blogSchema.pre("findOneAndUpdate", function (next) {
    this._update.updated_at = new Date();
    next();
});
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
