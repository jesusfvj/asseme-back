const express = require("express");
const searchRouter = express.Router();
const checkJWT = require("../middlewares/checkJWT");
const {
    search,
    searchById
} = require("../controllers/search");

searchRouter.get("/:query", search);
searchRouter.get("/searchbyid/:query/:userId", checkJWT, searchById);

module.exports = searchRouter;