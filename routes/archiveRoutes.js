const express = require("express");
const archiveController = require("../controllers/archiveController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get("/", archiveController.getArchivedBlogs);

router.patch("/:blogId", archiveController.archiveBlog);

router.patch("/unarchive/:blogId", archiveController.unarchiveBlog);
router.get("/status/:blogId", archiveController.fetchBlogArchiveStatus);

module.exports = router;
