require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Item = require("../models/Item");
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

  const topTenItems = await Item.aggregate([{
      $match: {}
    },
    {
      $project: {
        __v: 0,
        password: 0,
        itemCloudinaryId: 0,
        name: 0,
        type: 0,
        keywords: 0,
        itemCloudinaryId: 0,
        lovedBy: 0,
        createdAt: 0,
        owner: 0,
        isBanned: 0,
      }
    },
    {
      $sort: {
        lovedBy: -1
      }
    },
    {
      $limit: 10
    }
  ]);

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

        .url-container{
          display: flex;
          row-gap: 0.5rem
          flex-wrap: wrap;
          justify-content: center;
          padding-left: 10px;
          padding-right: 10px;
        }

        .img{
          height: auto
          width: auto
          object-fit: contain;
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
      
      <div class="url-container">
  <img class="img" src="${topTenItems[0].itemUrl}" alt="Meme 1">
  <img class="img" src="${topTenItems[1].itemUrl}" alt="Meme 2">
  <img class="img" src="${topTenItems[2].itemUrl}" alt="Meme 3">
  <img class="img" src="${topTenItems[3].itemUrl}" alt="Meme 4">
  <img class="img" src="${topTenItems[4].itemUrl}" alt="Meme 5">
  <img class="img" src="${topTenItems[5].itemUrl}" alt="Meme 6">
  <img class="img" src="${topTenItems[6].itemUrl}" alt="Meme 7">
  <img class="img" src="${topTenItems[7].itemUrl}" alt="Meme 8">
  <img class="img" src="${topTenItems[8].itemUrl}" alt="Meme 9">
  <img class="img" src="${topTenItems[9].itemUrl}" alt="Meme 10">
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

    const userFromDbArray = await User.aggregate([{
        $match: {
          email,
        }
      },
      {
        $project: {
          __v: 0,
          profilePhotoCloudinaryId: 0,
          role: 0
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "followedBy",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "uploadedItems",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "lovedItems",
          foreignField: "_id",
          as: "lovedItems"
        }
      },
    ]);

    const userFromDb = userFromDbArray[0]

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
        ...userFromDb,
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
  const {
    userId
  } = req.params;

  if (userId.length !== 24) {
    return res.status(200).json({
      ok: false,
    });
  }

  try {
    const user = await User.aggregate([{
        $match: {
          _id: userId,
        }
      },
      {
        $project: {
          __v: 0,
          password: 0,
          profilePhotoCloudinaryId: 0
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "followedBy",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "uploadedItems",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "lovedItems",
          foreignField: "_id",
          as: "lovedItems"
        }
      },
    ]);

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

const getUsers = async (req, res) => {
  try {
    const users = await User.aggregate([{
        $match: {}
      },
      {
        $project: {
          __v: 0,
          password: 0,
          profilePhotoCloudinaryId: 0,
          role: 0
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "followedBy",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "uploadedItems",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "lovedItems",
          foreignField: "_id",
          as: "lovedItems"
        }
      },
    ]);

    if (!users) {
      return res.status(200).json({
        ok: false,
      });
    }

    return res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      ok: false,
      message: `Something happened`,
    });
  }
};

const toggleFollowing = async (req, res) => {
  const { artistId, isFollowed } = req.body;
  const { userId } = req.params;

  try {
    const loggedUser = await User.findOne({
      _id: userId,
    });
    const followedUser = await User.findOne({
      _id: artistId,
    });

    if (isFollowed) {
      await loggedUser.updateOne({
        $push: {
          following: artistId,
        },
      });
      await followedUser.updateOne({
        $push: {
          followedBy: userId,
        },
      });

    } else {
      await loggedUser.updateOne({
        $pull: {
          following: artistId,
        },
      });
      await followedUser.updateOne({
        $pull: {
          followedBy: userId,
        },
      });


    }
    return res.status(200).json({
      ok: true,
      isFollowed,
    });
    
  } catch (error) {
    return res.status(503).json({
      ok: false,
      msg: "Oops, something happened",
    });
  }
};

module.exports = {
  register,
  logInUser,
  getUserById,
  getUsers,
  toggleFollowing
};