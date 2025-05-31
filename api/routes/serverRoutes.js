const express = require('express');
const router = express.Router();
const serverUtils = require('../utils/serverUtils');
const { Sema } = require('async-sema');

const consoleSema = new Sema(1);

router.put('/console/run/:command', async (req, res) => {
    await consoleSema.acquire();
    try{
        await serverUtils.runMCCommand(req.params.command);
        res.status(200).send("done");
    }catch(error){
        console.error(error)
        res.status(500).send("error.. "+error.message);
    }finally{
        consoleSema.release();
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
    await startStopSema.acquire();
    try {
        if (await serverUtils.isServerOn()) {
            res.status(400).send('Server is already running.');
            return;
        }
        if (!serverUtils.isEULAsigned()){
            res.status(400).send('EULA must be signed.');
            return;
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