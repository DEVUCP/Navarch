const installationsService = require('../services/installations.service');
const { updateConfigAttribute } = require('../utils/config.util');
const { Sema } = require('async-sema');

const downloadSema = new Sema(1);

async function downloadServer(req, res) {
    await downloadSema.acquire();
    
    try {
        await installationsService.downloadRouter(req.params.platform, req.params.version);
        res.status(201).send('Downloaded Successfully');

        updateConfigAttribute("platform", req.params.platform);
        updateConfigAttribute("version", req.params.version);
    } catch (error) {
        res.status(500).send(`Error downloading server files: ${error}`);
    } finally{
        downloadSema.release();
    }
}

module.exports = {
    downloadServer
}