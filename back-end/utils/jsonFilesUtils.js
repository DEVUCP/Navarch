const consts = require("../consts");
const fs = require("fs");
const crypto = require('crypto');

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


function getBannedIPsJSON(){
    try {
        if(!fs.existsSync(consts.serverBannedPlayersPath)){
            return {};
        }
        var BannedIPsJSON = JSON.parse(fs.readFileSync(consts.serverBannedIPsPath,{ encoding: 'utf8', flag: 'r' }));
        return BannedIPsJSON;

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

async function modifyWhitelistJSON(playerName, add){  
    var whitelistJSON = getWhitelistJSON();


    const uuid = await getUUID(playerName);
    if(add){
        for(let i = 0; i < whitelistJSON.length ; i++){
            if(whitelistJSON[i].uuid == uuid){
                throw new Error(`Player ${playerName} already whitelisted`);
            }
        }
        whitelistJSON.push(
        {
            "name": playerName,
            "uuid": uuid,
            }
        )
    } else {
        let duplicateExist = true;
        for(let i = 0; i < whitelistJSON.length ; i++){
            if(whitelistJSON[i].uuid == uuid){
                duplicateExist = false;
                whitelistJSON.splice(i, 1);
                break;
            }
        }
        if(duplicateExist)
            throw new Error(`Player ${playerName} is not whitelisted`);
    }

    fs.writeFileSync(consts.serverWhitelistPath, JSON.stringify(whitelistJSON, null, 4), {encoding : 'utf8'});

}

async function modifyBannedPlayersJSON(playerName, add){  


    function getCurrentTimeISOFormatted() {
        const now = new Date();
        const isoStr = now.toISOString(); // "2025-03-29T12:28:02.123Z"
        
        // Extract and reformat parts
        const [date, time] = isoStr.split('T');
        const formattedTime = time.replace(/\..+Z$/, ''); // Remove milliseconds and 'Z'
        
        return `${date} ${formattedTime} +0000`;
    }
    
    
    var BannedPlayersJSON = getBannedPlayersJSON();

    const uuid = await getUUID(playerName);
    if(add){
        for(let i = 0; i < BannedPlayersJSON.length ; i++){
            if(BannedPlayersJSON[i].uuid == uuid){
                throw new Error(`Player ${playerName} already banned`);
            }
        }
        BannedPlayersJSON.push(
        {
            "name": playerName,
            "uuid": uuid,
            "created": getCurrentTimeISOFormatted(),
            "source": "Server",
            "expires": "forever",
            "reason": "Banned by an operator."
            }
        )
    } else {
        let duplicateExist = true;
        for(let i = 0; i < BannedPlayersJSON.length ; i++){
            if(BannedPlayersJSON[i].uuid == uuid){
                duplicateExist = false;
                BannedPlayersJSON.splice(i, 1);
                break;
            }
        }
        if(duplicateExist)
            throw new Error(`Player ${playerName} is not banned`);
    }

    fs.writeFileSync(consts.serverBannedPlayersPath, JSON.stringify(BannedPlayersJSON, null, 4), {encoding : 'utf8'});

}

async function modifyBannedIPsJSON(ip, add){  


    function getCurrentTimeISOFormatted() {
        const now = new Date();
        const isoStr = now.toISOString(); // "2025-03-29T12:28:02.123Z"
        
        // Extract and reformat parts
        const [date, time] = isoStr.split('T');
        const formattedTime = time.replace(/\..+Z$/, ''); // Remove milliseconds and 'Z'
        
        return `${date} ${formattedTime} +0000`;
    }
    
    
    var BannedIPsJSON = getBannedIPsJSON();

    if(add){
        for(let i = 0; i < BannedIPsJSON.length ; i++){
            if(BannedIPsJSON[i].ip == ip){
                throw new Error(`IP ${ip} already banned`);
            }
        }
        BannedIPsJSON.push(
        {
            "ip": ip,
            "created": getCurrentTimeISOFormatted(),
            "source": "Server",
            "expires": "forever",
            "reason": "Banned by an operator."
            }
        )
    } else {
        let duplicateExist = true;
        for(let i = 0; i < BannedIPsJSON.length ; i++){
            if(BannedIPsJSON[i].ip == ip){
                duplicateExist = false;
                BannedIPsJSON.splice(i, 1);
                break;
            }
        }
        if(duplicateExist)
            throw new Error(`IP ${ip} is not banned`);
    }

    fs.writeFileSync(consts.serverBannedIPsPath, JSON.stringify(BannedIPsJSON, null, 4), {encoding : 'utf8'});

}




async function getUUID(username) {
    var uuid = await getMojangUUID(username);
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



module.exports = {
    getWhitelistJSON,
    getOpsJSON,
    getBannedPlayersJSON,
    modifyOpsJSON,
    modifyWhitelistJSON,
    modifyBannedPlayersJSON,
    modifyBannedIPsJSON,
    getUUID,
}