const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.post("/:blogId/subscribe", subscriptionController.subscribeToBlog);
router.delete(
    "/:blogId/unsubscribe",
    subscriptionController.unsubscribeFromBlog
);
router.get("/:blogId/subscribers", subscriptionController.getSubscribersOfBlog);

module.exports = router;
