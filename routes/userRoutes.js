const express = require("express");
const userRouter = express.Router();
const checkJWT = require("../middlewares/checkJWT");
const {
  register,
  logInUser,
  getUserById,
  getUsers
} = require("../controllers/user");

userRouter.post("/register", register);
userRouter.post("/login", logInUser);
userRouter.get("/getuserbyid/:userId", checkJWT, getUserById);
userRouter.get("/getusers", getUsers);

module.exports = userRouter;