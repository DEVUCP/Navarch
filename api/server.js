const http = require('http');
const { app } = require('./app');
const configUtils = require('./utils/config.util')

// Util files
const starter =  require('./starter'); 
const cleaner = require('./cleaner'); //  [ DO NOT REMOVE] Not explicitly used, but implicitly used.

const api_port = configUtils.getConfigAttribute("api_port");
const mc_port = configUtils.getConfigAttribute("mc_port");

// Listen on IPv6
http.createServer(app).listen(api_port, '::', async () => {
  console.log(`Listening on IPv6 [::]:${api_port}`);
  await starter.startServer(api_port, mc_port);
});