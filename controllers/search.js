const User = require("../models/User");
const Item = require("../models/Item");
const mongoose = require("mongoose");

const search = async (req, res) => {
    const {
        query
    } = req.params;

    try {
        const users = await User.find({
            role: "user",
            name: {
                $regex: new RegExp(query, "i")
            },
        });

        const items = await Item.find({
            $or: [{
                    name: {
                        $regex: new RegExp(query, "i")
                    }
                },
                {
                    keywords: {
                        $regex: new RegExp(query, "i")
                    }
                }
            ]
        });

        return res.status(200).json({
            ok: true,
            results: {
                users,
                items
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(503).json({
            ok: false,
            msg: error,
        });
    }
};

const searchById = async (req, res) => {
    const {
        query,
        userId
    } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);

    try {
        const users = await User.find({
            _id: {
                $ne: objectId
            },
            role: "user",
            name: {
                $regex: new RegExp(query, "i")
            },
        });

        const items = await Item.find({
            $or: [{
                    name: {
                        $regex: new RegExp(query, "i")
                    }
                },
                {
                    keywords: {
                        $regex: new RegExp(query, "i")
                    }
                }
            ]
        });

        return res.status(200).json({
            ok: true,
            results: {
                users,
                items
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(503).json({
            ok: false,
            msg: error,
        });
    }
};

module.exports = {
    search,
    searchById
};