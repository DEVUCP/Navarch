const fs = require('fs');
const path = require('path');
const pidusage = require('pidusage')
const AdmZip = require('adm-zip');

let startTime = null;

function startCounting() {
    startTime = Date.now();
}

function stopCounting() {
    startTime = null;
}

function getStartTime() {
    return startTime;
}

async function getMemoryUsage(serverProcess) {
    if (!serverProcess || !serverProcess.pid)
        return { error: 'Server process not running or PID unavailable' };

    try {
        const stats = await pidusage(serverProcess.pid);
        return {
            usedMB: Math.round(stats.memory / 1024 / 1024),
            cpu: Math.round(Number(stats.cpu.toFixed(1)) / 10 * 10) / 10 + '%',
        };
    } catch (err) {
        return { error: 'Failed to get usage stats: ' + err.message };
    }
}

function getDirectorySize(folderPath) {
    let totalSize = 0;
  
    function walkDir(currentPath) {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const stats = fs.statSync(fullPath);
  
        if (entry.isFile()) {
          totalSize += stats.size;
        } else if (entry.isDirectory()) {
          walkDir(fullPath); // Recursively walk into the directory
        }
      }
    }
  
    walkDir(folderPath);
  
    const sizeInMB = totalSize / (1024 * 1024);
    return sizeInMB;
  }

function getPlatform(jarPath) {
  const zip = new AdmZip(jarPath);
  const entries = zip.getEntries();
  const names = entries.map(e => e.entryName);

  console.log(names);

  const has = (file) => names.includes(file);

  // Detect Paper
  if (
    names.some(name => name.startsWith("paperclip/")) ||
    names.some(name => name.startsWith("io/papermc/paperclip/"))
  ) return "Paper";

  // Detect Forge
  if (
    has("patch.properties") || has("META-INF/mods.toml") ||
    has("bootstrap-shim.properties") ||
    names.some(name => name.startsWith("net/minecraftforge/bootstrap/"))
  ) return "Forge";

  // Detect Fabric 
  if (
    has("fabric.mod.json") || has("META-INF/fabric.mod.json") ||
    names.some(name => name.startsWith("net/fabricmc/"))
  ) return "Fabric";

  return "Vanilla";
}
  
function getVersion(jarPath) {
  if (getPlatform(jarPath) == "Fabric") {
    console.error("Unable to get version from fabric servers");
    return "Unable to fetch version";
  }

  const zip = new AdmZip(jarPath);
  const entries = zip.getEntries();

  const versionEntry = entries.find(e => e.entryName === "version.json");
  if (versionEntry) {
      try {
          const content = JSON.parse(zip.readAsText(versionEntry));
          console.log(content);
          return content.name || content.id || null;
      } catch (err) {
          console.warn("Failed to parse version.json:", err.message);
      }
  }

  const manifestEntry = entries.find(e => e.entryName === "META-INF/MANIFEST.MF");
  if (manifestEntry) {
      const text = zip.readAsText(manifestEntry);
      const match = text.match(/Implementation-Version:\s*(.*)/);
      if (match) return match[1].trim();
  }

  return null;
}


module.exports = {
    startCounting,
    stopCounting,
    getStartTime,
    getMemoryUsage,
    getDirectorySize,
    getPlatform,
    getVersion
}