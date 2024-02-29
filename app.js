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
app.set("trust proxy", 1);
const corsOptions = {
    origin: ["https://scribbles-snowy.vercel.app", "http://localhost:5173"],
    optionsSuccessStatus: 200,
    exposedHeaders: "Authorization",
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());

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
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErorHandler);

module.exports = app;
