const consts = require("../consts");
const fs = require("fs");
const { getConfigAttribute } = require("./configUtils");
const { spawn } = require('child_process');

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
}