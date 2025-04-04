const crypto = require('crypto');
const consts = require('../consts');
const fs = require("fs");

function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

function handleHostAuthCheck(res, req, functionToExecute) {
    try{
        if(req.ip === "127.0.0.1"){
            console.log("Host Authorized", req.ip);
            return functionToExecute();
        } else {
            console.log("Unauthorized... user attempt to appear as host!", req.ip);
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
function isKeysJSONExisting() {
  return fs.existsSync(consts.keysJSONPath);
}

function isHostKeyGenerated() {
    if (!isKeysJSONExisting()) {
        return false;
    } else {
        const keys = JSON.parse(fs.readFileSync(consts.keysJSONPath));
        return keys.host !== undefined;
    }
}

function doesEntryExist(name, key){
    try{
        const keys = JSON.parse(fs.readFileSync(consts.keysJSONPath));
        return keys[name] === key;
    } catch (error) {
        console.error(error);
        return false;
    }
}


function generateHostKey() {
    addApiEntry("host");
}

function addApiEntry(name,key=generateApiKey()){
    var keys = {}
    if (!isKeysJSONExisting()) {
        keys = {
            [name]: key
        };
    } else {
        keys = JSON.parse(fs.readFileSync(consts.keysJSONPath));
        if(keys[name]){
            throw new Error("Entry already exists");
        }
        keys[name] = generateApiKey();
    }
    fs.writeFileSync(consts.keysJSONPath, JSON.stringify(keys, null, 4));
}

function removeApiEntry(name){
    if(!isKeysJSONExisting())
        throw new Error("keys.json does not exist");
    
    var keys = JSON.parse(fs.readFileSync(consts.keysJSONPath));

    if(!keys[name])
        throw new Error("Entry does not exist");

    delete keys[name];
    fs.writeFileSync(consts.keysJSONPath, JSON.stringify(keys, null, 4));
}



module.exports = { 
    generateApiKey,
    isHostKeyGenerated,
    generateHostKey,
    isKeysJSONExisting,
    addApiEntry,
    removeApiEntry,
    doesEntryExist,
    handleHostAuthCheck
};
