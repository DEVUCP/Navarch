const serverDirectory = '../server';
const serverName = 'server.jar';
const launchOptions = './launch-options.json'
const serverLogsFilePath = `${serverDirectory}/server_output.txt`;
const serverPropertiesPath = `${serverDirectory}/server.properties`
const configFilePath = "./server-config.json";
const upnpcPath = '/upnpc';


module.exports = {
    serverDirectory,
    serverName,
    serverLogsFilePath,
    serverPropertiesPath,
    launchOptions,
    upnpcPath,
    configFilePath,
};