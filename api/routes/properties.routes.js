const express = require('express');
const router = express.Router();
const propertiesServices = require('../services/properties.service');

const { 
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
 } = require("../controllers/properties.controller");

router.get('/', async (req, res) => {
    try {
        const properties = await propertiesServices.getProperties();
        res.status(200).contentType("json").send(properties);
    } catch(error) {
        console.error(error);
        res.status(500).send("error.. " + error.message);
    }
})

router.put('/update/:property/:newvalue', updateProperty);

router.put('/allocate-ram/:mb', allocateRam);

router.get('/server-config.json', serverConfig);

router.get('/whitelist.json', getWhitelist);

router.get('/ops.json', getOps);

router.get('/banned-players.json', getBannedPlayers);

router.put('/:operation/op/:playername', modifyOperator);

router.put('/:operation/whitelist/:playername', modifyWhitelist);

router.put('/:operation/ban/:playername', modifyBanned);

router.put('/:operation/ban-ip/:ip', modifyBannedIPs);

module.exports = router;