const serverDirectory = '../server';
const serverName = 'server.jar';
const launchOptions = './launch-options.json'
const serverLogsFilePath = `${serverDirectory}/server_output.txt`;
const serverPropertiesPath = `${serverDirectory}/server.properties`
const serverWhitelistPath = `${serverDirectory}/whitelist.json`
const serverOpsPath = `${serverDirectory}/ops.json`
const serverBannedPlayersPath = `${serverDirectory}/banned-players.json`
const serverBannedIPsPath = `${serverDirectory}/banned-ips.json`
const keysJSONPath = './keys.json';


const configFilePath = "./server-config.json";
const eulaFilePath = `${serverDirectory}/eula.txt`;
const upnpcPath = '/upnpc';

const serverStatus = {
    OFFLINE: 0,
    RUNNING: 1,
    STARTING: 2
};

module.exports = {
    serverDirectory,
    serverName,
    serverLogsFilePath,
    serverPropertiesPath,
    launchOptions,
    upnpcPath,
    configFilePath,
    serverWhitelistPath,
    serverOpsPath,
    serverBannedPlayersPath,
    serverBannedIPsPath,
    keysJSONPath,
    eulaFilePath,
    serverStatus
};