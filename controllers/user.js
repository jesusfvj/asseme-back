require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  uuid
} = require("uuidv4");
const generateJWT = require("../helpers/generateJWT");

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
    html: `<html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          margin-top: 50px;
        }
        
        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 20px;
        }
        
        p {
          color: #666;
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        .gratitude {
          font-style: italic;
          color: #999;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to ASSEME ${name}!</h1>
      <p>Thank you for registering in ASSEME. Please find below the top 10 GIFs and memes of the week:</p>
      
      <div>
  <img src="https://example.com/meme1.jpg" alt="Meme 1">
  <img src="https://example.com/meme2.jpg" alt="Meme 2">
  <img src="https://example.com/meme3.jpg" alt="Meme 3">
  <img src="https://example.com/meme4.jpg" alt="Meme 4">
  <img src="https://example.com/meme5.jpg" alt="Meme 5">
  <img src="https://example.com/meme6.jpg" alt="Meme 6">
  <img src="https://example.com/meme7.jpg" alt="Meme 7">
  <img src="https://example.com/meme8.jpg" alt="Meme 8">
  <img src="https://example.com/meme9.jpg" alt="Meme 9">
  <img src="https://example.com/meme10.jpg" alt="Meme 10">
</div>
    
      <p class="gratitude">Thank you for your support! Goodbye.</p>
    </body>
    </html>`,
  };

    if (password !== repPassword) {
      return res.status(400).json({
        ok: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(409).json({
        ok: false,
        message: "User already exists",
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
      message: "Oops, we could not save your data",
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
        message: "Email and password don't match.",
      });
    }

    if (userFromDb.isBanned === true) {
      return res.status(200).json({
        ok: false,
        message: "Your account has being banned due to the violation of our company policy. Please contact us for further information.",
      });
    }

    const comparedPassword = bcrypt.compareSync(password, userFromDb.password);

    if (!comparedPassword) {
      return res.status(400).json({
        ok: false,
        message: "Email and password don't match.",
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
      message: "Oops, we could not verify your data",
    });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (userId.length !== 24) {
    return res.status(200).json({
      ok: false,
    });
  }

  try {
    const user = await User.findOne({
      _id: userId,
    },{
      __v: 0,
      password: 0
    })
     /*  .populate("playlists")
      .populate("followedPlaylists")
      .populate({
        path: "tracks",
        populate: {
          path: "artist",
        },
      })
      .populate({ path: "albums", populate: { path: "artist" }, populate: {path: "songs"} })
      .populate("following")
      .populate({
        path: "playerQueue",
        populate: {
          path: "tracks",
          populate: {
            path: "artist",
          },
        },
      }); */

    if (!user) {
      return res.status(200).json({
        ok: false,
      });
    }

    return res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: `Could not find the user with the id: ${userId}`,
    });
  }
};

module.exports = {
  register,
  logInUser,
  getUserById
};