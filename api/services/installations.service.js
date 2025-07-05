const urlFetcher = require("../utils/url_fetcher.util");
const infoService = require('../services/info.service');
const consts = require('../consts');
const { writeDownloadedFile } = require("../utils/installations.util");
const fs = require('fs/promises');
const path = require('path');

const preserveList = [
    "world",
    "world_nether",
    "world_the_end",
    "banned-ips.json",
    "banned-players.json",
    "ops.json",
    "whitelist.json"
];
  
async function purgeServer(preserveList) {
    let folderPath = consts.serverDirectory;
    try {
        const entries = await fs.readdir(folderPath, { withFileTypes: true });

        for (const entry of entries) {
            if (preserveList.includes(entry.name)) continue;

            const fullPath = path.join(folderPath, entry.name);
            if (entry.isDirectory())
                await fs.rm(fullPath, { recursive: true, force: true });
            else
                await fs.unlink(fullPath);
        }

        console.log(`Deleted everything in ${folderPath} except preserved items.`);
    } catch (err) {
        console.error(`Error cleaning folder ${folderPath}:`, err.message);
    }
}

async function downloadRouter(platform, version) {
    const oldPlatform = infoService.getPlatform();
    
    const comingFromModded = oldPlatform === "fabric" || oldPlatform === "forge";
    const currentPreserveList = comingFromModded
    ? preserveList.slice(3) // delete worlds
    : preserveList;         // keep everything
    
    if (oldPlatform != platform)
        await purgeServer(currentPreserveList);
    
    let response;
    try {
        switch (platform) {
            case "vanilla":
                response = await fetch(await urlFetcher.fetchVanillaURL(version));
                break;
            case "paper":
                response = await fetch(await urlFetcher.fetchPaperURL(version));
                break;
            case "fabric":
                response = await fetch(await urlFetcher.fetchFabricURL(version));
                break;
            case "forge":
                response = await fetch(await urlFetcher.fetchForgeURL(version));
                break;
            default:
                throw new Error(`Invalid platform --> ${platform}`);
        }

        await writeDownloadedFile(response, version, platform.toUpperCase());
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    downloadRouter
}