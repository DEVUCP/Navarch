
const cors = require('cors');

const apiKeyValidation = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    const apiName = req.header('x-api-name');
    if ((apiKey && 
        apiAccessUtils.doesEntryExist(apiName, apiKey) 
        )
        || debug === true) {
        console.log("API Key Validation Passed for", req.ip);
        next();
    } else {
        console.log("API Key Validation Failed for", req.ip);
        res.status(401).json({ error: 'Unauthorized' });
    }
  };


const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    max: 100, // maximum of 10 requests per window (15 sec) 
    windowMs:  15 * 1000, // Window : 15 seconds
    message: "You are being rate-limited.",
    headers: {
        "Retry-After": 15
    }
});

module.exports = {
    limiter,
    apiKeyValidation,
    cors,
    
};