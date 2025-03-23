const fs = require('fs');
const os = require('os');
const { configFilePath } = require("../consts")

function doesConfigExist(){
    return fs.existsSync("server-config.json")
}

function getConfigAttribute(attributeName){
    const config = fs.readFileSync(configFilePath, { encoding: 'utf8', flag: 'r' });
    const jsonConfig = JSON.parse(config);
    return jsonConfig[attributeName];

}

function generateConfigFile(){
    let config = {
        os: os.type(),
        memory: "1024M",
        platform: "vanilla",
        version: "1.21.4"
    };
    const jsonConfig = JSON.stringify(config, null, 4);
    fs.writeFileSync("./server-config.json", jsonConfig);
}


module.exports = {
    generateConfigFile,
    doesConfigExist,
    getConfigAttribute,

}