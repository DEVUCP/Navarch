const fs = require('fs');
const os = require('os');
const { configFilePath } = require("../consts")

function doesConfigExist(){
    return fs.existsSync("server-config.json")
}

function getConfigAttribute(attributeName){
    const jsonConfig = getConfigJSON();
    return jsonConfig[attributeName];

}

function getConfigJSON(){
    const config = fs.readFileSync(configFilePath, { encoding: 'utf8', flag: 'r' });
    return JSON.parse(config);
    
}

function updateConfigAttribute(name, value){
    var config = getConfigJSON();
    config[name] = value;
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 4));

}

function generateConfigFile(OS=os.type(),
                            memory="1024M",
                            platform="vanilla",
                            version="1.21.4",
                            port=25565,
                            debug=false,
                        ){
    let config = {
        os: OS,
        memory: memory,
        platform: platform,
        version: version,
        port: port,
        debug: debug
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
}