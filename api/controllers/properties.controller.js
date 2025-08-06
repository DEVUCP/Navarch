const propertiesService = require("../services/properties.service");
const configUtils = require("../utils/config.util");
const jsonFilesUtils = require("../utils/files.util");

const { Sema } = require('async-sema');

let togglePropertySema = new Sema(1);

async function updateProperty(req, res) {
    togglePropertySema.acquire();

    try {
        console.log(req.params.property);
        await propertiesService.updateProperty(req.params.property, req.params.newvalue);
        res.status(200).send("done");
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    } finally {
        togglePropertySema.release();
    }
}

let ramAllocationSema = new Sema(1);

async function allocateRam(req, res) {
    ramAllocationSema.acquire();

    try {
        configUtils.updateMemoryAllocated(req.params.mb, true);
        res.status(200).send(`Ram allocation updated to ${req.params.mb}M`);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    } finally {
        ramAllocationSema.release();
    }
}

async function serverConfig(req, res) {
    try {
        const configJSON = configUtils.getConfigJSON();
        res.status(200).send(configJSON);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getWhitelist(req, res) {
    try {
        const whitelistJSON = jsonFilesUtils.getWhitelistJSON();
        res.status(200).send(whitelistJSON);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getOps(req, res) {
    try {
        const opsJSON = jsonFilesUtils.getOpsJSON();
        res.status(200).send(opsJSON);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function getBannedPlayers(req, res) {
    try {
        const bannedplayersJSON = jsonFilesUtils.getBannedPlayersJSON();
        res.status(200).send(bannedplayersJSON);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function modifyOperator(req, res) {
    try {
        if (req.params.operation != "add" && req.params.operation != "remove") {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
            return;
        }

        await jsonFilesUtils.modifyOpsJSON(req.params.playername, req.params.operation === "add");
        res.status(200).send(`${req.params.operation === "add" ? "Added" : "Remove"} ${req.params.playername} as an Operator`);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function modifyWhitelist(req, res) {
    try {
        if (req.params.operation != "add" && req.params.operation != "remove") {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
            return;
        }

        await jsonFilesUtils.modifyWhitelistJSON(req.params.playername, req.params.operation === "add");
        if (req.params.operation === "add")
            res.status(200).send(`Added ${req.params.playername} to the Whitelist`);
        else
            res.status(200).send(`Remove ${req.params.playername} from the Whitelist`);
            
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function modifyBanned(req, res) {
    try {
        if (req.params.operation != "add" && req.params.operation != "remove") {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
            return;
        }

        await jsonFilesUtils.modifyBannedPlayersJSON(req.params.playername, req.params.operation === "add");
        if (req.params.operation === "add")
            res.status(200).send(`Banned ${req.params.playername}`);
        else
            res.status(200).send(`Pardoned ${req.params.playername}`);
            
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}

async function modifyBannedIPs(req, res) {
    try {
        if (req.params.operation != "add" && req.params.operation != "remove") {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
            return;
        }

        await jsonFilesUtils.modifyBannedIPsJSON(req.params.playername, req.params.operation === "add");
        if (req.params.operation === "add")
            res.status(200).send(`Banned ${req.params.playername}`);
        else
            res.status(200).send(`Pardoned ${req.params.playername}`);
            
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
}


module.exports = {
    updateProperty,
    allocateRam,
    serverConfig,
    getWhitelist,
    getOps,
    getBannedPlayers,
    modifyOperator,
    modifyWhitelist,
    modifyBanned,
    modifyBannedIPs
}