const express = require('express');
const router = express.Router();
const installationsUtils = require('../utils/installationsUtils');

const { Sema } = require('async-sema');

const downloadSema = new Sema(1);

router.put('/download/:platform/:version', async (req, res) => {
    await downloadSema.acquire();
    
    try {
        await installationsUtils.downloadRouter(req.params.platform, req.params.version);
        res.status(201).send('Downloaded Successfully');
    } catch (error) {

        res.status(500).send(`Error downloading server files: ${error}`);
    } finally{
        downloadSema.release();
    }
});


module.exports = router;