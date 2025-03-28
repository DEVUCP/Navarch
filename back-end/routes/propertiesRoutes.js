const express = require('express');
const router = express.Router();
const propertiesUtils = require('../utils/propertiesUtils');
const configUtils = require("../utils/configUtils");

const { Sema } = require('async-sema');

let togglePropertySema = new Sema(1);

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


module.exports = router;