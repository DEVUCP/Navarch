const networkingUtils = require('./utils/networkingUtils');
const apiAccessUtils = require('./utils/apiAccessUtils');
const configUtils = require('./utils/configUtils')

const debug = configUtils.getConfigAttribute("debug");


async function startServer(api_port, mc_port) {
    if (!apiAccessUtils.isHostKeyGenerated()){
        console.log("generating host key");
        apiAccessUtils.generateHostKey();
    }
    console.log(`port: ${api_port}`);
    
    if (!configUtils.doesConfigExist()){
        configUtils.generateConfigFile();
        console.log("sever-config generated successfully")
    }
    const ip = await networkingUtils.getIP(local=true)
    console.log("local-ip:", ip);

    if(debug === false){

        await networkingUtils.forwardPort(api_port, ip);
        await networkingUtils.forwardPort(3000, ip); // port forwarding for frontend
        await networkingUtils.forwardPort(mc_port, ip);
    }

    console.log("====== API STARTED! ======")

}

module.exports = {
    startServer
};