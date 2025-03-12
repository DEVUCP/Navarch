const express = require('express');
const router = express.Router();
const serverUtils = require('../utils/serverUtils');
const { Sema } = require('async-sema');


router.put('/console/run/:command', async (req, res) => {
    try{
        await serverUtils.runMCCommand(req.params.command);
        res.status(200).send("done");
    }catch(error){
        console.error(error)
        res.status(500).send("error.. "+error.message);
    }
})

router.get('/console-text', async (req, res) =>{
    try {
        const consoleOutput = serverUtils.getServerlogs();
        if(consoleOutput == null){
            return res.status(200).send("The server is offline...");
        }else{
            return res.status(200).send(consoleOutput);
        }
    } catch (error) {
        res.status(500).send();
    }
});

const downloadSema = new Sema(1);

router.put('/download/:version', async (req, res) => {
    await downloadSema.acquire();
    
    try {
        await serverUtils.downloadServerFiles(req.params.version);
        res.status(201).send('Downloaded Successfully');
    } catch (error) {

        res.status(500).send(`Error downloading server files: ${error}`);
    } finally{
        downloadSema.release();
    }
});

router.get('/check-exist', (req, res) => {
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

const startStopSema = new Sema(1);

// Route to start the server
router.put('/start', async (req, res) => {
    await startStopSema.acquire()
    try {
        if (await serverUtils.isServerOn()) {
            res.status(400).send('Server is already running.');
        }

        await serverUtils.startServer();
        res.send('Server started.');
    } catch (error) {
        res.status(500).send(`Error starting server: ${error}`);
    } finally {
        startStopSema.release()
        console.log("startstop sema RELEASED")
    }
});

// Route to stop the server
router.put('/stop', async (req, res) => {
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