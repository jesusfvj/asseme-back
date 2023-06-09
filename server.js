const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRouter = require("./routes/userRoutes");
const itemRouter = require("./routes/itemRoutes");
const searchRouter = require("./routes/searchRoutes");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/user", userRouter);
app.use("/item", itemRouter);
app.use("/search", searchRouter);

module.exports = app;