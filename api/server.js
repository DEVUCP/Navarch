const express = require('express');
const middleware = require('./middleware/middleware');

const app = express();

app.use(middleware.cors());
app.use(middleware.limiter)
app.use(express.json());
// app.use(middleware.apiKeyValidation);

// Route files
const adminRoutes = require('./routes/adminRoutes');
const configUtils = require('./utils/configUtils')
const serverRoutes = require('./routes/serverRoutes'); // Routes are separated
const propertiesRoute = require('./routes/propertiesRoutes'); // Routes are separated
const installationsRoutes = require('./routes/installationsRoutes'); // Routes are separated

// Util files
const networkingUtils = require('./utils/networkingUtils');
const apiAccessUtils = require('./utils/apiAccessUtils');
const cleaner = require('./cleaner');

// constants

const port = 3001;
const debug = configUtils.getConfigAttribute("debug");



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