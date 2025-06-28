const fs = require('fs');
const os = require('os');
const { configFilePath } = require("../consts");

const defaultConfig =  {
    "os": os.type(),
    "memory": "1024M",
    "platform": "vanilla",
    "version": "1.21.4",
    "start_with_script": false,
    "mc_port": 25565,
    "api_port": 3001,
    "debug": false
};

function doesConfigExist() {
    return fs.existsSync("server-config.json");
}

function getConfigAttribute(attributeName) {
    try {
        const jsonConfig = getConfigJSON();
        return jsonConfig[attributeName];
    } catch (error) {
        return defaultConfig[attributeName];
    }
}

function getConfigJSON() {
    const config = fs.readFileSync(configFilePath, { encoding: 'utf8', flag: 'r' });
    return JSON.parse(config);
}

function updateConfigAttribute(name, value) {
    try {
        var config = getConfigJSON();
        config[name] = value;
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 4));
    } catch (error) {
        throw new Error(`Failed to update config attribute: ${error.message}`);
    }
}

function updateMemoryAllocated(valueMB) {
    const freeMemoryMB = Math.floor(os.freemem() / (1024 * 1024));
    const totalMemoryMB = Math.floor(os.totalmem() / (1024 * 1024));

    if (valueMB > freeMemoryMB * 0.98)
        throw new Error(`Not enough free memory! Only ${freeMemoryMB} MB free out of ${totalMemoryMB} MB`);

    updateConfigAttribute("memory", valueMB);
}

function generateConfigFile() {
    const jsonConfig = JSON.stringify(defaultConfig, null, 4);
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