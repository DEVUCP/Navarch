const consts = require("../consts");
const fs = require("fs");


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


module.exports = {
    getProperties,
    updateProperty,
}