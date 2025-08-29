const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        let folderName = 'images';
        if (imageTypes.includes(file.mimetype)) {
            folderName = 'properties';
        }

        const targetDir = path.join(uploadDir, folderName);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^\w.-]/g, '');
        const fileName = `${Date.now()}_${safeName}`;
        cb(null, fileName);
    }



});

const fileFilter = (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024,
    },
});

const uploadMedia = upload.fields([
    { name: 'images', maxCount: 15 },

]);

module.exports = { uploadMedia };
