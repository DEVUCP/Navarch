
async function fetchPaperURL(version){
    try {
        const build = await fetchLatestBuildPaper(version);
        const url =`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`;
        return url;
    } catch (error) {
        console.error(error);
    }
}

async function fetchVanillaURL(version){
    try{
        const hash = await fetchVanillaFirstHash(version);
        const response = await fetch(`https://piston-meta.mojang.com/v1/packages/${hash}/${version}.json`);
        const packagesData = await response.json();
        
        const url = packagesData["downloads"]["server"]["url"];
        
        return url;
        
    }catch(error){
        console.error(error);
    }
}

async function fetchForgeURL(version){
    try{
        const LatestForgeVersion = await fetchForgeLatestVersion(version);
        const forgeURL = `https://maven.minecraftforge.net/net/minecraftforge/forge/${version}-${LatestForgeVersion}/forge-${version}-${LatestForgeVersion}-installer.jar`;
        return forgeURL;
        
    }catch(error){
        console.error(error);
    }
}

async function fetchFabricURL(version) {
    try {
        const fabricLoader = await fetchFabricLoader();
        const fabricInstaller = await fetchFabricInstaller();
        const fabricURL = `https://meta.fabricmc.net/v2/versions/loader/${version}/${fabricLoader}/${fabricInstaller}/server/jar`;
        return fabricURL;
        
    } catch (error) {
        console.error(error);
    }   
}

async function fetchForgeLatestVersion(version){
    try{
        const response = await fetch(`https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json`);
        const forgeManifest = await response.json();
        const forgeLatestVersion = forgeManifest["promos"][`${version}-latest`];
    
        return forgeLatestVersion;
    
    }catch(error){
        console.error(error);
    }
}

async function fetchLatestBuildPaper(version) {
    const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`);
    const jsonBuildData = await response.json();
    const latestPaperBuild = jsonBuildData.builds.at(-1).build;
    
    return latestPaperBuild;
}

async function fetchFabricLoader(){
    try {
        const fabricResponse = await fetch("https://meta.fabricmc.net/v2/versions/loader");
        const fabricLoaders = await fabricResponse.json();
        const firstStableLoader = fabricLoaders.find(value => value["stable"])["version"];
        return firstStableLoader;
        
    } catch(error){
        console.error(error);
    }
}

async function fetchFabricInstaller(){
    try {
        const fabricResponse = await fetch("https://meta.fabricmc.net/v2/versions/installer");
        const fabricInstallers = await fabricResponse.json();
        const latestFabricInstaller = fabricInstallers.find(value => value["stable"])["version"];
        
        return latestFabricInstaller;
        
    }catch(error){
        console.error(error);
    }
}


async function fetchVanillaFirstHash(version){
    const response = await fetch(`https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`);
    const versionManifest = await response.json();
    
    for (const versionData of versionManifest.versions) {
        if (version === versionData["id"]) {
            console.log(`OK: ${version} hash found!`);
            return versionData.sha1;
        }
    }
    return null;
}
module.exports = {
    fetchVanillaURL,
    fetchPaperURL,
    fetchFabricURL,
    fetchForgeURL,
}