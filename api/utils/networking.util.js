const consts = require("../consts");
const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const configUtils = require('./config.util')



const execPromise = util.promisify(exec);

async function getIP(local) {
  switch(configUtils.getConfigAttribute("os")){
    case "Windows_NT":
      return await getIP_WINDOWS(local);
    case "Linux":
      return await getIP_LINUX(local);
    case _:
      return await getIP_LINUX(local);
  }
}

async function forwardPort(internal_port, ip, protocol="TCP", external_port=internal_port) {
  const os = configUtils.getConfigAttribute("os");
  try {
    let upnpcPath = "";

    if(os =="Windows_NT"){
      upnpcPath = path.normalize(path.join(__dirname, '../upnpc/upnpc-shared.exe'));
    }else{
      upnpcPath = "upnpc";
    }
    

    const { stdout, stderr } = await execPromise(`"${upnpcPath}" -a ${ip} ${internal_port} ${external_port} ${protocol}`);

    if (stdout) {
      console.log(`Command stdout: ${stdout}`);
    }

    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return null;
    }

  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return null;
  }
}

async function removePortMapping(external_port, protocol="TCP") {
  const os = configUtils.getConfigAttribute("os");
  try {
    let upnpcPath = "";

    if(os == "Windows_NT") {
      upnpcPath = path.join(__dirname, '../upnpc/upnpc-shared.exe');
    } else {
      upnpcPath = "upnpc";
    }
    
    const { stdout, stderr } = await execPromise(`"${upnpcPath}" -d ${external_port} ${protocol}`);

    if (stdout) {
      console.log(`Command stdout: ${stdout}`);
    }

    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return null;
    }

  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return null;
  }
}

async function getIP_WINDOWS(local) {
  try {
    const upnpcPath = path.join(__dirname, '../upnpc/upnpc-shared.exe');
    const { stdout, stderr } = await execPromise(`"${upnpcPath}" -l`); // Wrap in quotes!
    
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return null;
    }

    if (local) {
      const localIpRegex = /Local LAN ip address : (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      const localIpMatch = stdout.match(localIpRegex);
      return localIpMatch ? localIpMatch[1] : 'Not found';
    } else {
      const response = await fetch("https://ifconfig.me");
      const publicIP = await response.text();
      return publicIP;
      // const publicIpRegex = /ExternalIPAddress = (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      // const publicIpMatch = stdout.match(publicIpRegex);
      // return publicIpMatch ? publicIpMatch[1] : 'Not found';
    }
  } catch (error) {
    console.error(`Error getting IP: ${error.message}`);
    return null;
  }
}

async function getIP_LINUX(local) {
  try {
    const upnpcPath = "upnpc"

    const { stdout, stderr } = await execPromise(`${upnpcPath} -l`);

    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return null;
    }

    if (local) {
      const localIpRegex = /Local LAN ip address : (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      const localIpMatch = stdout.match(localIpRegex);
      return localIpMatch ? localIpMatch[1] : 'Not found';
    } else {
      const publicIpRegex = /ExternalIPAddress = (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      const publicIpMatch = stdout.match(publicIpRegex);
      return publicIpMatch ? publicIpMatch[1] : 'Not found';
    }
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return null;
  }
}


module.exports = {
    getIP,
    forwardPort,
    removePortMapping,
}
