const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  age: {
    type: String,
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
    default: [],
  },
  followedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
    default: [],
  },
  uploadedItems: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Item",
    required: true,
    default: [],
  },
  lovedItems: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Items",
    required: true,
    default: [],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  profilePhoto: {
    type: String,
    required: true,
    default: "https://spanishbit.es/no-profile.jpg",
  },
  profilePhotoCloudinaryId: {
    type: String,
    required: true,
    default: "empty",
  },
  isBanned:{
    type: Boolean,
    default: false
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
