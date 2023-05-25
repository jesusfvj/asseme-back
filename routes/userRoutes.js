const express = require("express");
const userRouter = express.Router();
const checkJWT = require("../middlewares/checkJWT");
const {
  register,
  logInUser,
  getUserById,
  getUsers,
  toggleFollowing
} = require("../controllers/user");

userRouter.post("/register", register);
userRouter.post("/login", logInUser);
userRouter.get("/getuserbyid/:userId", checkJWT, getUserById);
userRouter.get("/getusers", getUsers);
userRouter.post("/togglefollowing/:userId", checkJWT, toggleFollowing);

module.exports = userRouter;