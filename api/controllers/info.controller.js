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
        
        res.status(200).send(await infoService.getUpTime());
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

async function getAllInfo(req, res) {
    try {
        let serverProcess = serverService.getServerProcess();
        let jarPath = consts.serverDirectory + "/" + consts.serverName
        res.status(200).send(await infoService.getInfo(serverProcess, jarPath, consts.serverDirectory));
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
    getPlatform,
    getAllInfo
}