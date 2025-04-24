
const fs = require('fs');
const consts = require("../consts");
const urlFetcher = require("./platformURLFetcherUtil");

async function downloadRouter(platform, version) {
    switch(platform){
        case "vanilla":
            await downloadVanilla(version);
            break;
        case "paper":
            await downloadPaper(version);
            break;
        case "fabric":
            await downloadFabric(version);
            break;
        case "forge":
            await downloadForge(version);
            break;
        case _:
            throw new Error(`Invalid platform --> ${platform}`)

    }
}



async function downloadVanilla(version) {
    try {
        const response = await fetch(
            await urlFetcher.fetchVanillaURL(version)
        );
        await writeDownloadedFile(response, version, "VANILLA");

    } catch (error) {
        console.error(error);
    }
}

async function downloadForge(version) {
    try {
        const response = await fetch(
            await urlFetcher.fetchForgeURL(version)
        );
        await writeDownloadedFile(response, version, "FORGE");

    } catch (error) {
        console.error(error);
    }
}

async function downloadPaper(version) {
    try {
        const response = await fetch(
            await urlFetcher.fetchPaperURL(version)
        );
        await writeDownloadedFile(response, version, "PAPER");

    } catch (error) {
        console.error(error);
    }
}

async function downloadFabric(version) {
    try {
        const response = await fetch(
            await urlFetcher.fetchFabricURL(version)
        );
        await writeDownloadedFile(response, version, "FABRIC");
        
    } catch (error) {
        console.error(error);
    }
}


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
    downloadRouter,
}