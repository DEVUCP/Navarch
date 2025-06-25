const express = require('express');
const router = express.Router();
const serverUtils = require('../utils/serverUtils');
const { runCommand, startServer } = require('../controllers/server.controller');
const { Sema } = require('async-sema');
const configUtils = require('../utils/configUtils');

const consoleSema = new Sema(1);

router.put('/console/run/:command', runCommand);

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
        const check = serverUtils.isServerStarting();
        switch(check) {
            case 2:
                // console.log("Server is starting...");
                res.status(200).send("2"); // 2 means starting
                break;
            case 1:
                // console.log("Server is running...");
                res.status(200).send("1"); // 1 means On
                break;
            default:
                // console.log("Server is offline...");
                res.status(200).send("0"); // 0 means Off
        }
    } catch (error) {
        res.status(500).send(`Error checking server: ${error}`);
    }
});

const startStopSema = new Sema(1);

// Route to start the server
router.put('/start', startServer);

// Route to stop the server
router.put('/stop', async (req, res) => {
    await startStopSema.acquire();
    try {
        if (!(await serverUtils.isServerOn())) {
            return res.status(400).send('Server is not running.');
        }
        
            try {
                await serverUtils.runMCCommand("stop");
            } catch {
                await serverUtils.killStrayServerInstance();
            }
            finally {
                serverUtils.deleteServerOutput();
                serverStatus = 0;
            }
            
        res.status(200).send('Server stopped.');
    } catch (error) {
        res.status(500).send(`Failed to stop server: ${error}`);
    } finally{
        startStopSema.release();
    }
});

router.put('/sign-eula', async (req, res) => {
    try {
        if (serverUtils.isEULAsigned()){
            res.status(400).send('EULA is already signed.');
        }
        serverUtils.signEULA();
        res.status(200).send('EULA signed.');
    } catch (error) {
        res.status(500).send(`Failed to sign EULA: ${error}`);
    }
});

module.exports = router;