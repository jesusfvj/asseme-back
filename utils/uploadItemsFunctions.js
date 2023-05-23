const path = require('path');
const fs = require('fs-extra');

const generateArrayKeywordsFromString = (stringKeywords) => {
    const arrayKeyords = stringKeywords.split(',').map(word => word.trim());
    return arrayKeyords;
}

const deleteFilesFromUploadFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);
            fs.unlinkSync(curPath);
        });
        /* fs.rmdirSync(folderPath); */
        console.log(`Deleted files from: ${folderPath}`);
    }
}

module.exports = {
    deleteFilesFromUploadFolder,
    generateArrayKeywordsFromString
}