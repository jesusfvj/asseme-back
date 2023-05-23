const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/user", userRouter);

module.exports = app;