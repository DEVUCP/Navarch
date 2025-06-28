const urlFetcher = require("../utils/url_fetcher.util");
const { writeDownloadedFile } = require("../utils/installations.util");

async function downloadRouter(platform, version) {
    let response;
    try {
        switch(platform) {
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
            case _:
                throw new Error(`Invalid platform --> ${platform}`)
        }
        await writeDownloadedFile(response, version, platform.toUpperCase());
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    downloadRouter
}