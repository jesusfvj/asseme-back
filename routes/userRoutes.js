const express = require("express");
const userRouter = express.Router();
const {
  register,
  logInUser,
  getUserById
} = require("../controllers/user");

userRouter.post("/register", register);
userRouter.post("/login", logInUser);
userRouter.get("/getuserbyid/:userId", getUserById);

module.exports = userRouter;