const express = require('express');
const router = express.Router();

const { 
    runCommand, 
    startServer, 
    getServerConsoleOutput, 
    checkExist, 
    checkServerStatus,
    stopServer,
    signEULA 
} = require('../controllers/server.controller');

router.put('/console/run/:command', runCommand);

router.get('/console-text', getServerConsoleOutput);

router.get('/check-exist', checkExist)

// Route to check if the server is running
router.get('/check-server', checkServerStatus);

// Route to start the server
router.put('/start', startServer);

// Route to stop the server
router.put('/stop', stopServer);

router.put('/sign-eula', signEULA);

module.exports = router;