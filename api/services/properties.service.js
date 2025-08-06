const consts = require("../consts");
const fs = require("fs");
const { getConfigAttribute } = require("../utils/config.util");
const { spawn } = require('child_process');
const os = require('os');

async function getProperties(){
    try{
        if(!fs.existsSync(consts.serverPropertiesPath)){
            throw new Error("server.properties file is missing... have you ran the server at least once before?");
        }
        var properties = fs.readFileSync(consts.serverPropertiesPath,{ encoding: 'utf8', flag: 'r' }).split('\n');

        return PropertiesToJSON(properties);
        
    }catch(error){
        console.error(error);
    }
}

async function updateProperty(propertyName, toggleable, updateValue){
    try{
        if(!fs.existsSync(consts.serverPropertiesPath)){
            throw new Error("server.properties file is missing... have you ran the server at least once before?");
        }
        const properties = JSON.parse(await getProperties());
        
        
        if(toggleable){
            console.log(properties[propertyName]);
            properties[propertyName] = (properties[propertyName] === "true") ? "false" : "true";
        }
        else{
        properties[propertyName] = `${updateValue}`;
        }

        const updatedProperties = JSONToProperties(properties);

        fs.writeFileSync(consts.serverPropertiesPath, updatedProperties, {encoding : 'utf8'});
        
    }catch(error){
        console.error(error);
    }
}

function PropertiesToJSON(properties){
    properties = properties.filter(line => (line !== "\n")); // filters new line
    properties = properties.filter(line => (line.trim() === '') || (line[0] !== "#")); // filters comments and empty lines
    const result = {};
    
    properties.forEach(line =>{

        const [key, value] = line.split('=');
        
        if (key && value !== undefined) {
            result[key.trim()] = value.trim();
        }
    })

    const json = JSON.stringify(result, null, null);

    return json;
}

function JSONToProperties(json){
    let properties = '';

    for (const [key, value] of Object.entries(json)) {
        properties += `${key}=${value}\n`;
    }
    return properties;
}

async function getOnlinePlayers() {
    const port = getConfigAttribute("mc_port");
    const platform = os.platform();
    let cmd, args;

    if (platform === "win32") {
        cmd = "netstat";
        args = ["-ano"];
    } else if (platform === "linux" || platform === "darwin") {
        cmd = "ss";
        args = ["-tanp"];
    } else {
        console.error("Unsupported OS:", platform);
        return 0;
    }

    return new Promise((resolve) => {
        let output = "";

        const proc = spawn(cmd, args);

        proc.stdout.on("data", (data) => {
            output += data.toString();
        });

proc.on("close", () => {
    const remoteIPs = new Set();
    const lines = output.split("\n");

    for (const line of lines) {
        const isEstablished = line.includes("ESTABLISHED") || line.includes("ESTAB");
        if (!isEstablished || !line.includes(`:${port}`)) continue;

        console.log("Raw line:", line);  // 🐛 DEBUG

        let remoteAddress = "";

        if (platform === "win32") {
            const parts = line.trim().split(/\s+/);
            console.log("Parsed parts (Windows):", parts);  // 🐛 DEBUG
            if (parts.length >= 3) {
                remoteAddress = parts[2].split(":")[0];
            }
        } else {
            const parts = line.trim().split(/\s+/);
            console.log("Parsed parts (Unix):", parts);  // 🐛 DEBUG

            // Find the remote IP/port field
            const addressField = parts.find(p => p.includes(":") && !p.includes("127.0.0.1"));
            if (addressField) {
                const ipPort = addressField.split(":");
                if (ipPort.length >= 2) {
                    remoteAddress = ipPort[0];
                }
            }
        }

        console.log("Remote address:", remoteAddress);  // 🐛 DEBUG

        if (
            remoteAddress &&
            remoteAddress !== "127.0.0.1" &&
            remoteAddress !== "::1" &&
            !remoteAddress.startsWith("192.168.") &&
            !remoteAddress.startsWith("10.") &&
            !remoteAddress.startsWith("172.")
        ) {
            remoteIPs.add(remoteAddress);
        }
    }

    // console.log("Unique IPs found:", [...remoteIPs]);  // 🐛 DEBUG
    resolve(remoteIPs.size);
        });

        proc.on("error", (err) => {
            console.error(`${cmd} error:`, err);
            resolve(0);
        });
    });
}

module.exports = {
    getProperties,
    updateProperty,
    getOnlinePlayers,
}