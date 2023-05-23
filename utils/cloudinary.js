require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

const uploadImage = async (filePath) => {
    return await cloudinary.uploader.upload(filePath, {
        folder: "ASSEME_file-folder",
        colors: true
    })
}

const deleteCloudinaryFile = async (cloudinaryId) => {
    return await cloudinary.uploader.destroy(cloudinaryId)
}

module.exports = {
    uploadImage,
    deleteCloudinaryFile
}