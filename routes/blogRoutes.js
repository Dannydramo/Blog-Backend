const express = require("express");
const blogController = require("../controllers/blogContoller");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);
router.get("/author/:authorId", blogController.getBlogsByAuthor);
router.get("/author-details/:authorId", blogController.getAuthorDetails);
router.get("/:category", blogController.getBlogsByCategory);
router.get(
    "/my-blogs/:id",
    authController.protect,
    blogController.getBlogsByUser
);
router.post("/post", authController.protect, blogController.postBlog);
router.patch("/edit/:id", authController.protect, blogController.editBlog);
router.post("/:id/reviews", authController.protect, reviewController.addReview);
router.get(
    "/reviews/:id",
    authController.protect,
    reviewController.getBlogReviews
);
router.patch(
    "/edit-review/:id",
    authController.protect,
    reviewController.editReview
);
router.delete(
    "/delete-review/:id",
    authController.protect,
    reviewController.deleteReview
);

module.exports = router;
