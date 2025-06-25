const serverService = require('../services/server.service');
const { Sema } = require('async-sema');

const consoleSema = new Sema(1);

async function runCommand(req, res) {
    await consoleSema.acquire();

    try {
        await serverService.runMCCommand(req.params.command);

        res.status(200).send("done");
    } catch(error) {
        console.error(error)

        res.status(500).send("Error: " + error.message);
    } finally {
        consoleSema.release();
    }
}

async function startServer(req, res) {
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
            serverUtils.serverStatus = 2;
    
            if( configUtils.getConfigAttribute("start_with_script") ){
                await serverUtils.startServerWithScript();
            }else{
                await serverUtils.startServer();
            }
            res.send('Server started.');
            
        } catch (error) {
            serverUtils.serverStatus = 0;
            res.status(500).send(`Error starting server: ${error}`);
        } finally {
            startStopSema.release()
            // console.log("startstop sema RELEASED")
        }
}

module.exports = {
    runCommand,
    startServer
}