const express = require('express');
const router = express.Router();
const serverUtils = require('../utils/serverUtils');

// Route to download server files
router.get('/download/:version', async (req, res) => {
    try {
        await serverUtils.downloadServerFiles(req.params.version);
        res.status(201).send('Downloaded Successfully');
    } catch (error) {
        res.status(500).send(`Error downloading server files: ${error}`);
    }
});

router.get('/files/check-exist', (req, res) => {
    try{
        const response = Boolean(serverUtils.doesServerJarAlreadyExist());
        res.status(200).send(response);
    }
    catch(error){
        res.status(500).send("Internal Server error while checking files");
    }
})

// Route to check if the server is running
router.get('/check-server', async (req, res) => {
    try {
        const isRunning = await serverUtils.isServerOn();
        res.status(200).send(isRunning);
    } catch (error) {
        res.status(500).send(`Error checking server: ${error}`);
    }
});

// Route to start the server
router.get('/start', async (req, res) => {
    try {
        if (await serverUtils.isServerOn()) {
            return res.status(400).send('Server is already running.');
        }

        await serverUtils.startServer();
        res.send('Server started.');
    } catch (error) {
        res.status(500).send(`Error starting server: ${error}`);
    }
});

// Route to stop the server
router.get('/stop', async (req, res) => {
    try {
        if (!(await serverUtils.isServerOn())) {
            return res.status(400).send('Server is not running.');
        }

        await serverUtils.killStrayServerInstance();
        res.status(200).send('Server stopped.');
    } catch (error) {
        res.status(500).send(`Failed to stop server: ${error}`);
    }
});

module.exports = router;