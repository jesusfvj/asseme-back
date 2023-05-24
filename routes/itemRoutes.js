const express = require("express");
const itemRouter = express.Router();
const multer = require("multer");
const checkJWT = require("../middlewares/checkJWT");
const {
  uploadItems,
  uploadItemUrl,
  getItems,
  getTopItems,
  deleteItem,
  editItem
} = require("../controllers/item");

const upload = multer({
  dest: "./uploads"
});

itemRouter.post("/uploadItems/:userId", checkJWT, upload.any(), uploadItems);
itemRouter.post("/uploaditemurl/:userId", checkJWT, uploadItemUrl);
itemRouter.get("/getitems", getItems);
itemRouter.get("/gettopitems", getTopItems);
itemRouter.post("/deleteitem/:itemId", checkJWT, deleteItem);
itemRouter.put("/edititem/:itemId", checkJWT, editItem);

module.exports = itemRouter;