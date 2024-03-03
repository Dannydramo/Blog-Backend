const { promisify } = require("util");
const passport = require("passport");
const cloudinary = require("cloudinary").v2;
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./../models/userModel");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(
    new GoogleStrategy(
        {
            clientID: `${process.env.GOOGLE_CLIENT_ID}`,
            clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
            callbackURL: `${process.env.GOOGLE_CALLBACK_URL}`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile._json.email });
                if (user) {
                    return done(null, user);
                } else {
                    const { picture, email, name } = profile._json;
                    const uploadedImage = await promisify(
                        cloudinary.uploader.upload
                    )(picture);
                    user = new User({
                        username: name,
                        email: email,
                        photo: uploadedImage.secure_url,
                        password: `${process.env.RANDOM_PASSWORD}`,
                        confirmPassword: `${process.env.RANDOM_PASSWORD}`,
                    });

                    await user.save();
                    return done(null, user);
                }
            } catch (error) {
                return done(error);
            }
        }
    )
);

module.exports = passport;
