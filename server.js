const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./.env" });

const DB = process.env.MONGODB_URL.replace(
    "<PASSWORD>",
    process.env.MONGODB_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((con) => {
        console.log("Connection Successful");
    });

app.listen(8000, () => {
    console.log("app runnning on port 8000");
});
