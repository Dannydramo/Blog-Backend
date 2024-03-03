const express = require("express");

// MIDDLEWARE IMPORTS
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

// ERROR HANDLERS IMPORTS
const AppError = require("./utils/appError");
const globalErorHandler = require("./controllers/errorController");

// ROUTE IMPORTS
const authRoute = require("./routes/authRoutes");
const blogRoute = require("./routes/blogRoutes");
const oauthRoute = require("./routes/oauthRoute");
const archiveRoute = require("./routes/archiveRoutes");
const subscriptionRoute = require("./routes/subscriptionRoutes");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];
app.use(
    cors({
        origin: function (origin, callback) {
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

app.use(
    session({
        secret: "your-secret-key", // Change this to a secret key for session encryption
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true if using HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (24 hours)
        },
    })
);

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
    max: 50,
    windowMs: 60 * 1000,
    message: "Too many request from this IP. Please try again later",
});

app.use("/api", limiter);

if (process.env.NODE_ENV === "dev") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/archive", archiveRoute);
app.use("/api/v1/subscription", subscriptionRoute);
app.use("/api/v1/oauth", oauthRoute);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErorHandler);

module.exports = app;
