const serverDirectory = '../server';
const serverName = 'server.jar';
const launchOptions = './launch-options.json'
const serverLogsFilePath = `${serverDirectory}/server_output.txt`;
const serverPropertiesPath = `${serverDirectory}/server.properties`

module.exports = {
    serverDirectory,
    serverName,
    serverLogsFilePath,
    serverPropertiesPath,
    launchOptions,
};