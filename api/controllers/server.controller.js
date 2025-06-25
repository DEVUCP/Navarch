const serverService = require('../services/server.service');
const configUtils = require('../utils/configUtils');

const { Sema } = require('async-sema');

const consoleSema = new Sema(1);
async function runCommand(req, res) {
    await consoleSema.acquire();

    try {
        await serverService.runMCCommand(req.params.command);

        res.status(200).send("done");
    } catch(error) {
        console.error(error);

        res.status(500).send("Error: " + error.message);
    } finally {
        consoleSema.release();
    }
}

const startStopSema = new Sema(1);
async function startServer(req, res) {
    await startStopSema.acquire();
        try {
            if (await serverService.isServerOn()) {
                res.status(400).send('Server is already running.');
                return;
            }
            if (!serverService.isEULAsigned()){
                res.status(400).send('EULA must be signed.');
                return;
            } 
            serverService.serverStatus = 2;
    
            if( configUtils.getConfigAttribute("start_with_script") ){
                await serverService.startServerWithScript();
            }else{
                await serverService.startServer();
            }
            res.send('Server started.');
            
        } catch (error) {
            serverService.serverStatus = 0;
            res.status(500).send(`Error starting server: ${error}`);
        } finally {
            startStopSema.release();
            // console.log("startstop sema RELEASED");
        }
}

async function stopServer(req, res) {
    await startStopSema.acquire();

    try {
        if (!(await serverService.isServerOn())) 
            return res.status(400).send('Server is not running.');
        
        try {
            await serverService.runMCCommand("stop");
        } catch {
            await serverService.killStrayServerInstance();
        } finally {
            serverService.deleteServerOutput();
            serverStatus = 0;
        }
            
        res.status(200).send('Server stopped.');
    } catch (error) {
        res.status(500).send(`Failed to stop server: ${error}`);
    } finally {
        startStopSema.release();
    }
}

async function getServerConsoleOutput(req ,res) {
    try {
        const consoleOutput = serverService.getServerlogs();

        return res.status(200).send(consoleOutput ?? "The server is offline...");
    } catch (error) {
        res.status(500).send();
    }
}

async function checkExist(req, res) {
    try{
        const response = Boolean(serverService.doesServerJarAlreadyExist());
        res.status(200).send(response);
    }
    catch(error){
        res.status(500).send("Internal Server error while checking files");
    }
}

async function checkServerStatus(req, res) {
    try {
        const status = serverService.isServerStarting();

        const statusMap = {
            0: "0",  // Offline (default)
            1: "1", // Running
            2: "2" // Starting
        };

        res.status(200).send(statusMap[status] ?? "0");
    } catch (error) {
        console.error("Error checking server:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function signEULA(req, res) {
    try {
        if (serverService.isEULAsigned()){
            res.status(400).send('EULA is already signed.');
        }
        serverService.signEULA();
        res.status(200).send('EULA signed.');
    } catch (error) {
        res.status(500).send(`Failed to sign EULA: ${error}`);
    }
}

module.exports = {
    runCommand,
    startServer,
    getServerConsoleOutput,
    checkExist,
    checkServerStatus,
    stopServer,
    signEULA
}