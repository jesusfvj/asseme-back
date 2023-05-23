require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs-extra");
const User = require("../models/User");
const Item = require("../models/Item");
const {
    uuid
} = require("uuidv4");
const {
    uploadImage,
    deleteCloudinaryFile
} = require("../utils/cloudinary");
const { grouperDataFunction, generateArrayKeywordsFromString, deleteFilesFromUploadFolder } = require("../utils/uploadItemsFunctions");

const uploadItems = async (req, res) => {
    try {
        const dataFiles = req.body;
        const userId = req.params.userId;

        if (!req.files) {
            return res.status(503).json({
                ok: false,
                msg: "No files uploaded",
            });
        }

        if (req.files) {
            const arrayIdItems = [];
            const files = req.files
            await Promise.all(
                files.map(async (item, index) => {
                    const {
                        itemName,
                        keywords
                    } = JSON.parse(
                        dataFiles[`dataFile${index + 1}`]
                    );

                    const keywordsArray = generateArrayKeywordsFromString(keywords)

                    const newItem = new Item({
                        name: itemName,
                        type: item.mimetype === "image/gif" ? 'gif' : 'meme',
                        owner: userId,
                        keywords: keywordsArray,
                    });

                    //Upload tracks and thumbnails to Cloudinary
                    const resultItem = await uploadImage(item.path);
                    newItem.itemUrl = resultItem.secure_url;
                    newItem.itemCloudinaryId = resultItem.public_id;

                    if (!resultItem) {
                        return res.status(503).json({
                            ok: false,
                            msg: "There was a problem uploading the files",
                        });
                    }

                    //Delete the files in the uploads folder
                    await fs.unlink(item.path);
                    arrayIdItems.push(newItem._id);
                    await newItem.save();
                })
            );

            await User.updateOne({
                _id: userId,
            }, {
                $push: {
                    uploadedItems: arrayIdItems,
                },
            });
        }

        deleteFilesFromUploadFolder("../uploads");
        return res.status(200).json({
            ok: true,
        });
    } catch (error) {
        console.log(error)
        return res.status(503).json({
            ok: false,
            msg: "Something happened...",
        });
    }
};

module.exports = {
    uploadItems
};