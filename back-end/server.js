const express = require('express');
const cors = require('cors');
const configUtils = require('./utils/configUtils')
const serverRoutes = require('./routes/serverRoutes'); // Routes are separated
const propertiesRoute = require('./routes/propertiesRoutes'); // Routes are separated
const installationsRoutes = require('./routes/installationsRoutes'); // Routes are separated
const networkingUtils = require('./utils/networkingUtils');

const app = express();
const port = 3001;

// Middleware
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

// Start the server
app.listen(port, async () => {
    console.log(`port: ${port}`);
    if (!configUtils.doesConfigExist()){
        configUtils.generateConfigFile();
        console.log("sever-config generated successfully")
    }
    const ip = await networkingUtils.getIP(local=true)
    console.log("local-ip:", ip);
    console.log(`attempting to forward ports ${port}, 3000`);
    networkingUtils.forwardPort(3000, ip);
    networkingUtils.forwardPort(3001, ip);

});