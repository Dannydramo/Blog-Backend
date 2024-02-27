const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoute = require("./routes/authRoutes");
const blogRoute = require("./routes/blogRoutes");
const archiveRoute = require("./routes/archiveRoutes");
const subscriptionRoute = require("./routes/subscriptionRoutes");
const AppError = require("./utils/appError");
const globalErorHandler = require("./controllers/errorController");
const app = express();

app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(
    "/public/img",
    (req, res, next) => {
        res.setHeader("Content-Type", "image/jpeg");
        next();
    },
    express.static(__dirname + "/public/img")
);

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
});

const limiter = rateLimit({
    max: 50,
    windowMs: 60 * 1000,
    message: "Too many request from this IP. Please try again later",
});
app.use("/api", limiter);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/archive", archiveRoute);
app.use("/api/v1/subscription", subscriptionRoute);
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErorHandler);

module.exports = app;
