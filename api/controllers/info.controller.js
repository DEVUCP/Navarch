const propertiesService = require('../services/properties.service');
const infoService = require('../services/info.service');
const serverService = require('../services/server.service');
const consts = require('../consts');

async function playerCount(req, res) {
    try {
        const playerCount = await propertiesService.getOnlinePlayers();

        res.status(200).send({ playerCount: playerCount });
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getUpTime(req, res) {
    try {
        if (infoService.getStartTime() === null) {
            res.status(200).send({ uptime: "0s" });
            return;
        }
        
        const ms = Date.now() - infoService.getStartTime();
    
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
    
        let formatted = [];
        if (hours > 0) formatted.push(`${hours}h`);
        if (minutes > 0 || hours > 0) formatted.push(`${minutes}m`);
        formatted.push(`${seconds}s`);
    
        res.status(200).send({ uptime: formatted.join(" ") });
    } catch (error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getMemoryUsage(req, res) {
    try {
        let serverProcess = serverService.getServerProcess();
        res.status(200).send(await infoService.getMemoryUsage(serverProcess));
    } catch (error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getWorldSize(req, res) {
    try {
        let worldSize = await infoService.getDirectorySize(consts.serverDirectory + "/world");
        res.status(200).send({ worldSize: `${worldSize.toFixed(2)}MB` });
    } catch (error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getVersion(req, res) {
    try {
        let version = infoService.getVersion(consts.serverDirectory + "/" + consts.serverName);
        res.status(200).send({ version: version });
    } catch (error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getPlatform(req, res) {
    try {
        let platform = infoService.getPlatform(consts.serverDirectory + "/" + consts.serverName);
        res.status(200).send({ platform: platform });
    } catch (error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

module.exports = {
    playerCount,
    getUpTime,
    getMemoryUsage,
    getWorldSize,
    getVersion,
    getPlatform
}