const express = require("express");
const userRouter = express.Router();
const multer = require("multer");
const checkJWT = require("../middlewares/checkJWT");
const {
  register,
  logInUser
} = require("../controllers/user");

const upload = multer({ dest: "./uploads" });

userRouter.post("/register", register);
userRouter.post("/login", logInUser);

module.exports = userRouter;