const express = require('express');
const router = express.Router();
const serverUtils = require('../utils/serverUtils');
const propertiesUtils = require('../utils/propertiesUtils');

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



module.exports = router;