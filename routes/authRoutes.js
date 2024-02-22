const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
    "/update-password",
    authController.protect,
    authController.updatePassword
);
router.get(
    "/user-details",
    authController.protect,
    userController.getUserDetails
);
router.patch(
    "/update-me",
    authController.protect,
    userController.uploadPhoto,
    userController.resizePhoto,
    userController.updateDetails
);
router.delete(
    "/delete-account",
    authController.protect,
    userController.deleteAccount
);
module.exports = router;
