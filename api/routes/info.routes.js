const express = require('express');
const router = express.Router();

const {
    playerCount,
    getUpTime,
    getMemoryUsage,
    getWorldSize,
    getVersion,
    getPlatform
} = require('../controllers/info.controller');

router.get('/player-count', playerCount);

router.get('/uptime', getUpTime);

router.get('/memory-usage', getMemoryUsage);

router.get('/world-size', getWorldSize);

router.get('/version', getVersion);

router.get('/platform', getPlatform);

module.exports = router;