const express = require("express");
const itemRouter = express.Router();
const multer = require("multer");
const checkJWT = require("../middlewares/checkJWT");
const {
  uploadItems,
  /* uploadItemUrl */
} = require("../controllers/item");

const upload = multer({
  dest: "./uploads"
});

itemRouter.post("/uploadItems/:userId", checkJWT, upload.any(), uploadItems);
/* itemRouter.post("/uploadItemUrl", checkJWT, uploadItemUrl); */

module.exports = itemRouter;