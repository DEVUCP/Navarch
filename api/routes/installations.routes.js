const express = require('express');
const router = express.Router();

const { downloadServer } = require('../controllers/installations.controller')

router.put('/download/:platform/:version', downloadServer);

module.exports = router;