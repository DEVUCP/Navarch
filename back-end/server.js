const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const configUtils = require('./utils/configUtils')
const serverRoutes = require('./routes/serverRoutes'); // Routes are separated
const propertiesRoute = require('./routes/propertiesRoutes'); // Routes are separated
const installationsRoutes = require('./routes/installationsRoutes'); // Routes are separated
const networkingUtils = require('./utils/networkingUtils');

async function cleanup() {
    console.log('Running cleanup tasks...');

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(3000);

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(3001);

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(configUtils.getConfigAttribute("port"));
}

process.on('exit', cleanup);

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

const app = express();
const port = 3001;

// Middleware

const limiter = rateLimit({
    max: 10, // maximum of 10 requests per window (15 sec) 
    windowMs:  15 * 1000, // Window : 15 seconds
    message: "You are being rate-limited."
});

app.use(limiter)
app.use(cors());
app.use(express.json());

// Routes
app.use('/server', serverRoutes);
app.use('/installations', installationsRoutes);
app.use('/properties', propertiesRoute);

// Default route
app.get('/', async (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

app.put('/close', async (req, res) =>{
    await cleanup();
    res.status(200).send("closed");
    process.exit(0);
})

// Start the server
app.listen(port, async () => {
    console.log(`port: ${port}`);
    if (!configUtils.doesConfigExist()){
        configUtils.generateConfigFile();
        console.log("sever-config generated successfully")
    }
    const ip = await networkingUtils.getIP(local=true)
    console.log("local-ip:", ip);

    console.log(configUtils.getConfigAttribute("debug"));
    if(configUtils.getConfigAttribute("debug") === false){
        networkingUtils.forwardPort(3001, ip);
        networkingUtils.forwardPort(3000, ip);
        networkingUtils.forwardPort(configUtils.getConfigAttribute("port"), ip);
    }

});