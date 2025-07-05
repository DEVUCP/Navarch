const apiAccessUtils = require('../utils/access.util');
const express = require('express');
const router = express.Router();

router.put('/close', async (req, res) =>{
    apiAccessUtils.handleHostAuthCheck(res, req, "Server Closed", async () => {
            try {
                res.status(200).send('Server closing...');
                process.exit(0);
            } catch (error) {
                res.status(500).send(`Failed to close server: ${error}`);
            }    });
});

router.post('/api/add/:apiName', (req, res) => {
    apiAccessUtils.handleHostAuthCheck(res, req, () => {
          try {
              const apiName = req.params.apiName;
            
              if (!apiName) {
                  return res.status(400).send('API Name is required');
              }
              apiAccessUtils.addApiEntry(apiName);
              res.status(200).send('API entry added successfully');
          } catch (error) {
              res.status(500).send(`Failed to add API entry: ${error}`);
          }
      });
      
})
router.post('/api/remove/:apiName', (req, res) => {
    apiAccessUtils.handleHostAuthCheck(res, req, () => {
          try {
              const apiName = req.params.apiName;

              if (!apiName) {
                  return res.status(400).send('API Name is required');
              }
              apiAccessUtils.removeApiEntry(apiName);
              res.status(200).send('API entry removed successfully');
          } catch (error) {
              res.status(500).send(`Failed to remove API entry: ${error}`);
          }
      });
})

        
module.exports = router;