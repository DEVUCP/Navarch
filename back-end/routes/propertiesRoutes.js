const express = require('express');
const router = express.Router();
const propertiesUtils = require('../utils/propertiesUtils');
const configUtils = require("../utils/configUtils");
const jsonFilesUtils = require("../utils/jsonFilesUtils");


const { Sema } = require('async-sema');

let togglePropertySema = new Sema(1);
let ramAllocationSema = new Sema(1);


router.get('/', async (req, res) => {
    try{
        const properties = await propertiesUtils.getProperties();
        res.status(200).contentType("json").send(properties);
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})


router.put('/toggle/:property', async (req, res) => {
    togglePropertySema.acquire()
    try{
        console.log(req.params.property);
        await propertiesUtils.updateProperty(req.params.property, true);
        res.status(200).send("done");
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }finally{
        togglePropertySema.release()
    }
})


router.put('/allocate-ram/:mb', async (req, res) => {
    ramAllocationSema.acquire()
    try{
        configUtils.updateMemoryAllocated(req.params.mb, true);
        res.status(200).send(`Ram allocation updated to ${req.params.mb}M`);
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }finally{
        ramAllocationSema.release()
    }
})

router.get('/player-count', async (req, res) => {
    try{
        const playerCount = await propertiesUtils.getOnlinePlayers()
        res.status(200).send({playerCount: playerCount});
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})

router.get('/server-config.json', async (req, res) => {
    try{
        const configJSON = configUtils.getConfigJSON();
        res.status(200).send(configJSON);
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})
router.get('/whitelist.json', async (req, res) => {
    try{
        const whitelistJSON = propertiesUtils.getWhitelistJSON();
        res.status(200).send(whitelistJSON);
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})
router.get('/ops.json', async (req, res) => {
    try{
        const opsJSON = propertiesUtils.getOpsJSON();
        res.status(200).send(opsJSON);
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})
router.get('/banned-players.json', async (req, res) => {
    try{
        const bannedplayersJSON = propertiesUtils.getBannedPlayersJSON();
        res.status(200).send(bannedplayersJSON);
    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})
router.put('/:operation/op/:playername', async (req, res) => {
    try{
        if(req.params.operation === "add"){
            await jsonFilesUtils.modifyOpsJSON(req.params.playername, true);
            res.status(200).send(`Added ${req.params.playername} as an Operator`);

        } else if(req.params.operation === "remove") {
            await jsonFilesUtils.modifyOpsJSON(req.params.playername, false);
            res.status(200).send(`Remove ${req.params.playername} as an Operator`);

        } else {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
        }

    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})

router.put('/:operation/whitelist/:playername', async (req, res) => {
    try{
        if(req.params.operation === "add"){
            await jsonFilesUtils.modifyWhitelistJSON(req.params.playername, true);
            res.status(200).send(`Added ${req.params.playername} as an Operator`);

        } else if(req.params.operation === "remove") {
            await jsonFilesUtils.modifyWhitelistJSON(req.params.playername, false);
            res.status(200).send(`Remove ${req.params.playername} as an Operator`);

        } else {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
        }

    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})

router.put('/:operation/ban/:playername', async (req, res) => {
    try{
        if(req.params.operation === "add"){
            await jsonFilesUtils.modifyBannedPlayersJSON(req.params.playername, true);
            res.status(200).send(`Banned ${req.params.playername} `);

        } else if(req.params.operation === "remove") {
            await jsonFilesUtils.modifyBannedPlayersJSON(req.params.playername, false);
            res.status(200).send(`Pardoned ${req.params.playername}`);

        } else {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
        }

    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})

router.put('/:operation/ban-ip/:ip', async (req, res) => {
    try{
        if(req.params.operation === "add"){
            await jsonFilesUtils.modifyBannedIPsJSON(req.params.ip, true);
            res.status(200).send(`Banned ${req.params.ip} `);

        } else if(req.params.operation === "remove") {
            await jsonFilesUtils.modifyBannedIPsJSON(req.params.ip, false);
            res.status(200).send(`Pardoned ${req.params.ip}`);

        } else {
            res.status(404).send(`Invalid operation ${req.params.operation}`);
        }

    }catch(error){
        console.error(error)
        res.status(500).send("error.. " + error.message);
    }
})

module.exports = router;