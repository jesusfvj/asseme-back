const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const checkJWT = async (req, res, next) => {

  const token = req.headers["x-token"];

  try {
    const {
      id
    } = jwt.verify(token, process.env.TOKEN_SECRET)

    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json({
        ok: false,
        msg: "Not a valid token",
      });
    }

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        msg: "Token expired",
      });
    } else if (!token) {
      return res.status(401).json({
        ok: false,
        msg: "Non-existent token",
      });
    }
  }
};

module.exports = checkJWT;