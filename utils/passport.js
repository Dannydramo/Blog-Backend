const { promisify } = require("util");
const passport = require("passport");
const cloudinary = require("cloudinary").v2;
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./../models/userModel");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: "scribbles",
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
            clientID: `786088249032-se10ffn65ivfnig9te55cq58m7in40sj.apps.googleusercontent.com`,
            clientSecret: `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`,
            callbackURL: `http://localhost:8000/api/v1/oauth/google/callback`,
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
