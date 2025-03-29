const consts = require("../consts");
const fs = require("fs");
const { getConfigAttribute } = require("./configUtils");
const { spawn } = require('child_process');
const crypto = require('crypto');

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

function getWhitelistJSON(){
    try {
        if(!fs.existsSync(consts.serverWhitelistPath)){
            return {};
        }
        var whitelistJSON = JSON.parse(fs.readFileSync(consts.serverWhitelistPath,{ encoding: 'utf8', flag: 'r' }));
        return whitelistJSON;

    } catch (error) {
        console.error(error);
    }
}

function getOpsJSON(){
    try {
        if(!fs.existsSync(consts.serverOpsPath)){
            return {};
        }
        var opsJSON = JSON.parse(fs.readFileSync(consts.serverOpsPath,{ encoding: 'utf8', flag: 'r' }));
        return opsJSON;

    } catch (error) {
        console.error(error);
    }  
}

async function modifyOpsJSON(playerName, add){
    var opsJSON = getOpsJSON();

    const uuid = await getUUID(playerName);
    if(add){
        for(let i = 0; i < opsJSON.length ; i++){
            if(opsJSON[i].uuid == uuid){
                throw new Error(`Player ${playerName} already an Operator`);
            }
        }
        opsJSON.push(
        {
            "uuid": uuid,
            "name": playerName,
            "level": 4,
            "bypassesPlayerLimit": false
            }
        )
    } else {
        let duplicateExist = true;
        for(let i = 0; i < opsJSON.length ; i++){
            if(opsJSON[i].uuid == uuid){
                duplicateExist = false;
                opsJSON.splice(i, 1);
                break;
            }
        }
        if(duplicateExist)
            throw new Error(`Player ${playerName} is not an Operator`);
    }

    fs.writeFileSync(consts.serverOpsPath, JSON.stringify(opsJSON, null, 4), {encoding : 'utf8'});

}

async function getUUID(username) {
    var uuid = await getMojangUUID(username);
    console.log(uuid);
    try {
        if(uuid === ''){
            console.log("UUID not found, generating one...")
            uuid = generateOfflineUUID(username);
        }
        return uuid;
    } catch (error) {
        console.error(error);
    }
}

async function getMojangUUID(username) {
    try {
        const playerInfo = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        const playerInfoJSON = await playerInfo.json();
        
        if(!playerInfoJSON)
            return "";
        else
            return `${playerInfoJSON["id"].slice(0, 8)}-${playerInfoJSON["id"].slice(8, 12)}-${playerInfoJSON["id"].slice(12, 16)}-${playerInfoJSON["id"].slice(16, 20)}-${playerInfoJSON["id"].slice(20)}`;
        
    } catch (error) {
        console.error(error);
    } 
}

async function generateOfflineUUID(username) {

    
    try {
        const data = `OfflinePlayer:${username}`;
        const hash = crypto.createHash('md5').update(data, 'utf8').digest();
        
        // Convert to UUID format (version 3)
        hash[6] = (hash[6] & 0x0f) | 0x30; // Set version to 3
        hash[8] = (hash[8] & 0x3f) | 0x80; // Set variant to RFC 4122
        
        const hex = hash.toString('hex');

        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    } catch (error) {
        console.error(error);
    } 
}


function getBannedPlayersJSON(){
    try {
        if(!fs.existsSync(consts.serverBannedPlayersPath)){
            return {};
        }
        var bannedPlayersJSON = JSON.parse(fs.readFileSync(consts.serverBannedPlayersPath,{ encoding: 'utf8', flag: 'r' }));
        return bannedPlayersJSON;

    } catch (error) {
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
    const port = getConfigAttribute("port");
    
    return new Promise((resolve) => {
        let output = '';
        
        const netstat = spawn('netstat', ['-ano']);
        const find = spawn('find', [`"${port}"`], { shell: true });

        netstat.stdout.pipe(find.stdin);
        
        find.stdout.on('data', (data) => {
            output += data.toString();
        });

        find.on('close', (code) => {
            if (code === 0 || code === 1) {  // find returns 1 when no matches
                const lines = output.trim().split('\n');
                const count = lines.filter(line => line.includes('ESTABLISHED')).length;
                resolve(count);
            } else {
                console.error('find command failed with code:', code);
                resolve(0);
            }
        });

        find.on('error', (err) => {
            console.error('find command error:', err);
            resolve(0);
        });
    });
}


module.exports = {
    getProperties,
    updateProperty,
    getOnlinePlayers,
    getWhitelistJSON,
    getOpsJSON,
    getBannedPlayersJSON,
    modifyOpsJSON,
    getUUID,
}