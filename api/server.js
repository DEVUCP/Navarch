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
const starter =  require('./starter'); 
const cleaner = require('./cleaner'); //  [ DO NOT REMOVE] Not explicitly used, but implicitly used.
// uses process object to catch and handle exit signals and cleanup tasks

// Routes
app.use('/server', serverRoutes);
app.use('/installations', installationsRoutes);
app.use('/properties', propertiesRoute);
app.use('/admin', adminRoutes);

app.get('/ping', async (req, res) => {
    res.send(`pong from ${await require("./utils/networkingUtils").getIP(local=false)}`);
});

const api_port = configUtils.getConfigAttribute("api_port");
const mc_port = configUtils.getConfigAttribute("mc_port");


// Start the server
app.listen(api_port, "0.0.0.0" ,async () => {
    await starter.startServer(api_port, mc_port);
});