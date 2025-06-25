const fs = require('fs');
const os = require('os');
const { configFilePath } = require("../consts")

const defaultConfig =  {
    "os": os.type(),
    "memory": "1024M",
    "platform": "vanilla",
    "version": "1.21.4",
    "start_with_script": false,
    "mc_port": 25565,
    "api_port": 3001,
    "debug": false

}

function doesConfigExist(){
    return fs.existsSync("server-config.json")
}

function getConfigAttribute(attributeName){
    try{
        const jsonConfig = getConfigJSON();
        return jsonConfig[attributeName];
    } catch (error) {
        return defaultConfig[attributeName];
    }

}

function getConfigJSON(){
    const config = fs.readFileSync(configFilePath, { encoding: 'utf8', flag: 'r' });
    return JSON.parse(config);
    
}

function updateConfigAttribute(name, value){
    try {
        var config = getConfigJSON();
        config[name] = value;
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 4));
    } catch (error) {
        throw new Error(`Failed to update config attribute: ${error.message}`);
    }
}

function updateMemoryAllocated(value){
    const freeMemoryMB = Math.floor(os.freemem()/0.000001);
    if(value > freeMemoryMB * 0.98){
        throw new Error(`Not enough free memory! only ${freeMemoryMB} free of ${Math.floor(os.totalmem()/0.000001)}`);
    }
    updateConfigAttribute("memory", value);
}

function generateConfigFile(OS=os.type(),
                            memory="1024M",
                            platform="vanilla",
                            version="1.21.4",
                            start_with_script=false,
                            mc_port=25565,
                            api_port=3001,
                            debug=false,
                        ){
    let config = {
        os: defaultConfig.os,
        memory: defaultConfig.memory,
        platform: defaultConfig.platform,
        version: defaultConfig.version,
        start_with_script: defaultConfig.start_with_script,
        mc_port: defaultConfig.mc_port,
        api_port: defaultConfig.api_port,
        debug: defaultConfig.debug
    };
    const jsonConfig = JSON.stringify(config, null, 4);
    fs.writeFileSync("./server-config.json", jsonConfig);
}


module.exports = {
    generateConfigFile,
    doesConfigExist,
    getConfigAttribute,
    updateConfigAttribute,
    getConfigJSON,
    updateMemoryAllocated,
}