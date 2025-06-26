const fs = require('fs');
const consts = require("../consts");

async function writeDownloadedFile(response, version, platform) {
    try{
        if (response.ok) {
        console.log(`Downloading ${platform} server.jar for version ${version}. STATUS: ${response.status}`);
        const fileName = `${consts.serverDirectory}/${consts.serverName}`;
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(fileName, buffer);
        console.log(`Successfully downloaded ${platform} ${fileName}!`);
    } else {
        throw new Error(`Failed to download ${platform} for version ${version}. STATUS: ${response.status}`);
    }
    } catch(error){
        console.error(error);
    }
}

module.exports = {
    writeDownloadedFile,
}