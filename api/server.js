const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const adminRoutes = require('./routes/adminRoutes');
const configUtils = require('./utils/configUtils')
const serverRoutes = require('./routes/serverRoutes'); // Routes are separated
const propertiesRoute = require('./routes/propertiesRoutes'); // Routes are separated
const installationsRoutes = require('./routes/installationsRoutes'); // Routes are separated
const networkingUtils = require('./utils/networkingUtils');
const apiAccessUtils = require('./utils/apiAccessUtils');

// constants

const app = express();
const port = 3001;
const debug = configUtils.getConfigAttribute("debug");


let cleanup_done = false;


async function cleanup() {

    if(debug){
        console.log("\nDebug mode is turned on\n Skipping cleanup tasks...\n if you don't intend this, change 'debug' from true to false in server-config.json");
        console.log("====== API TERMINATED! ======");
        cleanup_done = true;
        return;
    }

    console.log('\nRunning cleanup tasks...');

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(3000);

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(3001);

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(configUtils.getConfigAttribute("port"));
}

process.on('exit', () => {
    if (!cleanup_done) {
        cleanup();
    }
});

process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
});

process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await cleanup();
    process.exit(1);
});


// Middleware

const apiKeyValidation = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    const apiName = req.header('x-api-name');
    if ((apiKey && 
        apiAccessUtils.doesEntryExist(apiName, apiKey) 
        )
        || debug === true
        || req.ip === "127.0.0.1") {
        console.log("API Key Validation Passed for", req.ip);
        next();
    } else {
        console.log("API Key Validation Failed for", req.ip);
        res.status(401).json({ error: 'Unauthorized' });
    }
  };

const limiter = rateLimit({
    max: 10, // maximum of 10 requests per window (15 sec) 
    windowMs:  15 * 1000, // Window : 15 seconds
    message: "You are being rate-limited.",
    headers: {
        "Retry-After": 15
    }
});

app.use(limiter)
app.use(cors());
app.use(express.json());
app.use(apiKeyValidation);

// Routes
app.use('/server', serverRoutes);
app.use('/installations', installationsRoutes);
app.use('/properties', propertiesRoute);
app.use('/admin', adminRoutes);

// Default route
app.get('/ping', async (req, res) => {
    res.send('pong');
});



// Start the server
app.listen(port, "0.0.0.0" ,async () => {
    await startServer();
});


async function startServer() {
    if (!apiAccessUtils.isHostKeyGenerated()){
        console.log("generating host key");
        apiAccessUtils.generateHostKey();
    }
    console.log(`port: ${port}`);
    
    if (!configUtils.doesConfigExist()){
        configUtils.generateConfigFile();
        console.log("sever-config generated successfully")
    }
    const ip = await networkingUtils.getIP(local=true)
    console.log("local-ip:", ip);

    if(debug === false){

        await networkingUtils.forwardPort(3001, ip);
        await networkingUtils.forwardPort(3000, ip);
        await networkingUtils.forwardPort(port, ip);
    }

    console.log("====== API STARTED! ======")


}