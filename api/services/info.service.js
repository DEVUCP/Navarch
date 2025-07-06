const fs = require('fs');
const path = require('path');
const pidusage = require('pidusage')
const AdmZip = require('adm-zip');
const consts = require('../consts');
const serverService = require("./server.service");

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

function getPlatform(jarPath = consts.serverDirectory + "/" + consts.serverName) {
  const zip = new AdmZip(jarPath);
  const entries = zip.getEntries();
  const names = entries.map(e => e.entryName);

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
  
  const zip = new AdmZip(jarPath);
  const entries = zip.getEntries();
  
  if (getPlatform(jarPath) == "Fabric") {
    const installEntry = entries.find(entry => entry.entryName === 'install.properties');
    const text = zip.readAsText(installEntry);
    return text.split("game-version=")[1];
  }
    
  const versionEntry = entries.find(e => e.entryName === "version.json");
  if (versionEntry) {
      try {
          const content = JSON.parse(zip.readAsText(versionEntry));
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

async function getUpTime() {
  if (getStartTime() === null) 
      return { uptime: "0s" };
  
  const ms = Date.now() - getStartTime();

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = [];
  if (hours > 0) formatted.push(`${hours}h`);
  if (minutes > 0 || hours > 0) formatted.push(`${minutes}m`);
  formatted.push(`${seconds}s`);

  return { uptime: formatted.join(" ") };
}

async function getInfo(serverProcess, jarPath, folderPath) {
  let memoryUsage = null;
  let platform = null;
  let version = null;
  let directorySizeMB = null;
  let serverStatus = null;

  try {
      memoryUsage = await getMemoryUsage(serverProcess);
  } catch (err) {
      console.warn('Failed to get memory usage:', err.message);
  }

  try {
      platform = getPlatform(jarPath);
  } catch (err) {
      console.warn('Failed to get platform:', err.message);
  }

  try {
      version = getVersion(jarPath);
  } catch (err) {
      console.warn('Failed to get version:', err.message);
  }

  try {
      directorySizeMB = getDirectorySize(folderPath);
      directorySizeMB = Math.round(directorySizeMB * 100) / 100;
  } catch (err) {
      console.warn('Failed to get directory size:', err.message);
  }

  try {
      uptime = await getUpTime();
  } catch (err) {
      console.warn('Failed to calculate uptime:', err.message);
  }

  try {
      serverStatus = serverService.isServerStarting();
  } catch (err) {
      console.warn('Failed to get server status:', err.message);
  }

  return {
      memoryUsage,
      platform,
      version,
      directorySizeMB,
      uptime: uptime.uptime,
      status: serverStatus
  };
}

module.exports = {
    startCounting,
    stopCounting,
    getStartTime,
    getMemoryUsage,
    getDirectorySize,
    getPlatform,
    getVersion,
    getInfo,
    getUpTime
}