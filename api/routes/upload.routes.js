const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const consts = require("../consts");
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = consts.serverDirectory + "/plugins";
        if(!fs.existsSync(uploadPath))
            throw new Error("No plugins folder"); 
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});


const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.status(200).send('File uploaded successfully.');
});

module.exports = router;
