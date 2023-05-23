const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["gif", "meme"],
    default: "gif",
    required: true,
  },
  itemUrl: {
    type: String,
    required: true,
  },
  itemCloudinaryId: {
    type: String,
    required: true,
  },
  lovedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isBanned:{
    type: Boolean,
    default: false
  }
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;


