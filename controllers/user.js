require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const fs = require("fs-extra");
const User = require("../models/User");
const {
  uuid
} = require("uuidv4");
const generateJWT = require("../helpers/generateJWT");
const {
  uploadImage,
  deleteCloudinaryFile
} = require("../utils/cloudinary");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "asseme.gifs.memes@gmail.com",
    pass: process.env.PASS,
  },
});

const register = async (req, res) => {
  const {
    name,
    lastName = "",
    email,
    age = "",
    password,
    repPassword
  } = req.body;

  const mailOptions = {
    from: "asseme.gifs.memes@gmail.com",
    to: email,
    subject: "ASSEME welcomes you!",
    text: `Hi ${name}, thanks for registering Muze!`,
  };

    if (password !== repPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Passwords do not match",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(409).json({
        ok: false,
        msg: "User already exists",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      lastName,
      age,
      role: "user",
    });

    await newUser.save();
    newUser.password = undefined;

    const token = await generateJWT(newUser._id);

    try {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

    return res.status(201).json({
      ok: true,
      user: {
        ...newUser._doc,
        token
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      msg: "Oops, we could not save your data",
    });
  }
};

const logInUser = async (req, res) => {
  const {
    email,
    password
  } = req.body;
  try {
    const userFromDb = await User.findOne({
      email,
    })
    /* .populate("playlists") */

    if (!userFromDb) {
      return res.status(400).json({
        ok: false,
        msg: "Email and password don't match.",
      });
    }

    if (userFromDb.isBanned === true) {
      return res.status(200).json({
        ok: false,
        msg: "Your account has being banned due to the violation of our company policy. Please contact us for further information.",
      });
    }

    const comparedPassword = bcrypt.compareSync(password, userFromDb.password);

    if (!comparedPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Email and password don't match.",
      });
    }

    const token = await generateJWT(userFromDb._id)
    userFromDb.password = undefined;
    return res.status(200).json({
      ok: true,
      user: {
        ...userFromDb._doc,
        token
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      msg: "Oops, we could not verify your data",
    });
  }
};


module.exports = {
  register,
  logInUser
};