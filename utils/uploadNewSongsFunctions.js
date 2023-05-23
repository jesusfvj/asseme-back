const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

const grouperDataFunction = (originalFilesObject) => {
    const groupedData = originalFilesObject.reduce((acc, curr) => {
        const num = curr.fieldname.match(/\d+$/)[0];
        const fileType = curr.fieldname.startsWith('audio') ? 'audio' : 'image';
        if (!acc[num]) {
            acc[num] = [];
        }
        acc[num][fileType] = curr;
        return acc;
    }, {});
    return Object.values(groupedData);
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

const formatDuration = (duration) => {
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor(duration / 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const getAudioDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            const duration = parseFloat(stdout);
            if (isNaN(duration)) {
                reject(new Error(`Unable to parse duration: ${stdout}`));
            } else {
                resolve(duration);
            }
        });
    });
};

module.exports = {
    grouperDataFunction,
    deleteFilesFromUploadFolder,
    formatDuration,
    getAudioDuration
}