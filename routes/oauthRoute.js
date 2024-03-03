const express = require("express");
const router = express.Router();
const passport = require("../utils/passport");
const jwt = require("jsonwebtoken");
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
    (req, res) => {
        console.log("goten");
    }
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false,
    }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRESIN,
        });
        const cookiesOption = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        if (process.env.NODE_ENV === "production") cookiesOption.secure = true;

        res.cookie("token", token, cookiesOption);
        res.redirect(`${process.env.FRONTEND_URL}`);
    }
);
module.exports = router;
