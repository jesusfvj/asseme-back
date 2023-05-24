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
const {
    grouperDataFunction,
    generateArrayKeywordsFromString,
    deleteFilesFromUploadFolder
} = require("../utils/uploadItemsFunctions");

const uploadItems = async (req, res) => {
    try {
        const dataFiles = req.body;
        const userId = req.params.userId;

        if (!req.files) {
            return res.status(503).json({
                ok: false,
                message: "No files uploaded",
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
                            message: "There was a problem uploading the files",
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
            message: "Something happened...",
        });
    }
};

const uploadItemUrl = async (req, res) => {
    try {
        console.log(req.body)
        const {
            url,
            keywords,
            name
        } = req.body;
        const userId = req.params.userId;

        const keywordsArray = generateArrayKeywordsFromString(keywords)

        const newItem = new Item({
            name: name,
            owner: userId,
            keywords: keywordsArray,
            itemUrl: url
        });

        await User.updateOne({
            _id: userId,
        }, {
            uploadedItems: newItem._id,
        });

        return res.status(200).json({
            ok: true,
        });
    } catch (error) {
        console.log(error)
        return res.status(503).json({
            ok: false,
            message: "Something happened...",
        });
    }
};

const getItems = async (req, res) => {
    try {
        const items = await Item.aggregate([{
                $match: {}
            },
            {
                $project: {
                    __v: 0,
                    password: 0,
                    itemCloudinaryId: 0
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lovedBy",
                    foreignField: "_id",
                    as: "lovedBy"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $limit: 100
            },
        ]);

        if (!items) {
            return res.status(200).json({
                ok: false,
            });
        }

        return res.status(200).json({
            ok: true,
            items,
        });
    } catch (error) {
        console.log(error);
        return res.status(503).json({
            ok: false,
            message: "Ooops... something went wrong",
        });
    }
};

const getTopItems = async (req, res) => {
    try {
        const items = await Item.aggregate([{
                $match: {}
            },
            {
                $project: {
                    __v: 0,
                    password: 0,
                    itemCloudinaryId: 0
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lovedBy",
                    foreignField: "_id",
                    as: "lovedBy"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $addFields: {
                    lovedByCount: {
                        $size: "$lovedBy"
                    }
                }
            },
            {
                $sort: {
                    lovedByCount: -1
                }
            },
            {
                $limit: 20
            }
        ]);

        if (!items) {
            return res.status(200).json({
                ok: false,
            });
        }

        return res.status(200).json({
            ok: true,
            items,
        });
    } catch (error) {
        console.log(error);
        return res.status(503).json({
            ok: false,
            message: "Ooops... something went wrong",
        });
    }
};

const deleteItem = async (req, res) => {
    const {
        userId
    } = req.body;
    const itemId = req.params.itemId;

    try {
        const loggedUser = await User.findOne({
            _id: userId,
        });
        const itemToDelete = await Item.findOne({
            _id: itemId,
        });

        if (itemToDelete.owner.toString() !== userId) {
            return res.status(401).json({
                ok: false,
                message: "You are not the owner of this item",
            });
        }
        await loggedUser.updateOne({
            $pull: {
                uploadedItems: itemId,
            },
        });

        const responseImage = await deleteCloudinaryFile(
            itemToDelete.itemCloudinaryId
        );
        if (!responseImage.result === "ok") {
            return res.status(503).json({
                ok: false,
                message: responseImage.result,
            });
        }

        await Item.findByIdAndDelete(itemId).then((deletedItem) => {
            return res.status(200).json({
                ok: true,
                deletedItem,
            });
        });

    } catch (error) {
        console.log(error);
        return res.status(503).json({
            ok: false,
            message: "Oops, something happened",
        });
    }
};

const editItem = async (req, res) => {
    const {
        userId,
        itemNewName
    } = req.body;

    const itemId = req.params.itemId;

    try {
       const itemToUpdate =  await Item.findOneAndUpdate({
            _id: itemId
        }, {
            $set: {
                name: itemNewName
            }
        })

        if (itemToUpdate.owner.toString() !== userId) {
            return res.status(401).json({
                ok: false,
                message: "You are not the owner of this item",
            });
        }

        return res.status(201).json({
            ok: true,
            itemNewName
        });

    } catch (error) {
        console.log(error);
        return res.status(503).json({
            ok: false,
            message: "Oops, something happened",
        });
    }
};

module.exports = {
    uploadItems,
    uploadItemUrl,
    getItems,
    getTopItems,
    deleteItem,
    editItem
};