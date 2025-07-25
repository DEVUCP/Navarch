const { spawn, exec } = require('child_process');
const fs = require('fs');
const consts = require("../consts");
const { freemem } = require('os');
const configUtils = require('../utils/config.util');

let serverProcess = null;
let serverStatus = consts.serverStatus.OFFLINE;

async function isServerOn() {
    try {
        const serverPID = configUtils.getConfigAttribute("os") != "Linux" ? await getStrayServerInstance_WINDOWS() : await getStrayServerInstance_LINUX();
        return serverPID || serverStatus == consts.serverStatus.RUNNING;
    } catch (error) {
        return false;
    }
}

function deleteServerOutput() {
    try {
        fs.rmSync(consts.serverLogsFilePath, { force: true });
    } catch (error) {
        console.error(error);
    }
}

function isServerStarting() {
    const serverLogs = getServerlogs();

    if (serverLogs == null || serverLogs.includes("All dimensions are saved"))
        return 0;

    if (serverLogs.includes("Starting") && !serverLogs.includes("Done")) {
        serverStatus = consts.serverStatus.STARTING;
        return serverStatus;
    } else if (serverLogs.includes("Done")) {
        serverStatus = consts.serverStatus.RUNNING;
        return serverStatus;
    } else{
        return 0;
    }
}

function isEULAsigned() {
    if (fs.existsSync(consts.eulaFilePath)){
        if (fs.readFileSync(consts.eulaFilePath, 'utf8').includes('eula=true')) 
            return true;
        else
            return false;
    } else
        return false;
}

function signEULA() {
    fs.writeFileSync(consts.eulaFilePath, 'eula=true');
}

function getServerlogs() {
    try {
        return fs.readFileSync(consts.serverLogsFilePath, { encoding: 'utf8', flag: 'r' });
    } catch (error) {
        return null;
    }
}

async function runMCCommand(command) {
    try {
        if (!isServerOn()) {
            throw new Error("Can't run command, server is offline.");
        }

        serverProcess.stdin.write(`${command}\n`);
    } catch(error) {
        console.error(error);
    }
}

function getStrayServerInstance_WINDOWS() {
    return new Promise((resolve, reject) => {
        const tasklist = spawn('tasklist', ['/FI', 'IMAGENAME eq java.exe']);

        let output = '';
        tasklist.stdout.on('data', (data) => {
            output += data.toString();
        });

        tasklist.stderr.on('data', (data) => {
            reject(`Error in tasklist: ${data.toString()}`);
        });

        tasklist.on('close', (code) => {
            if (code !== 0) 
                reject(`tasklist command failed with code ${code}`);
            else if (!output.includes('java.exe'))
                reject('No Minecraft server found with java.exe');
            else {
                const netstat = spawn('netstat', ['-ano']);

                let netstatOutput = '';
                netstat.stdout.on('data', (data) => {
                    netstatOutput += data.toString();
                });

                netstat.stderr.on('data', (data) => {
                    reject(`Error in netstat: ${data.toString()}`);
                });

                netstat.on('close', (code) => {
                    if (code !== 0) 
                        reject(`netstat command failed with code ${code}`);
                    else {
                        const port = configUtils.getConfigAttribute("port");

                        const regex = new RegExp(`TCP\\s+.*:${port}\\s+.*\\s+LISTENING\\s+(\\d+)`, 'i');
                        const match = netstatOutput.match(regex);
                                             
                        if (match) 
                            resolve(parseInt(match[1]));
                        else 
                            reject(`No Minecraft server found on port ${port}`);
                    }
                });
            }
        });
    });
}

function getStrayServerInstance_LINUX() {
    return new Promise((resolve, reject) => {
        // Step 1: Get all Java process PIDs
        const ps = spawn('ps', ['-C', 'java', '-o', 'pid=']);

        let output = '';
        ps.stdout.on('data', (data) => {
            output += data.toString();
        });

        ps.stderr.on('data', (data) => {
            reject(`Error in ps: ${data.toString()}`);
        });

        ps.on('close', (code) => {
            if (code !== 0)
                return reject(`ps command failed with code ${code}`);

            const javaPIDs = output.trim().split('\n').map(line => line.trim()).filter(Boolean);
            if (javaPIDs.length === 0) 
                return reject('No Java processes found.');

            // Step 2: Check for listeners on the target port
            const ss = spawn('ss', ['-tlnp']);
            let ssOutput = '';

            ss.stdout.on('data', (data) => {
                ssOutput += data.toString();
            });

            ss.stderr.on('data', (data) => {
                reject(`Error in ss: ${data.toString()}`);
            });

            ss.on('close', (code) => {
                if (code !== 0)
                    return reject(`ss command failed with code ${code}`);

                const port = configUtils.getConfigAttribute("mc_port"); // assumed defined
                const lines = ssOutput.split('\n');

                for (const line of lines) {
                    if (line.includes(`:${port}`) && line.includes('LISTEN') && line.includes('pid=')) {
                        const pidMatch = line.match(/pid=(\d+)/);
                        if (pidMatch) {
                            const pid = pidMatch[1];
                            if (javaPIDs.includes(pid))
                                return resolve(parseInt(pid, 10));
                        }
                    }
                }

                reject(`No Java process found listening on port ${port}`);
            });
        });
    });
}

async function killStrayServerInstance() {
    try {
        if (configUtils.getConfigAttribute("os") == "Linux") {
            const strayServerPID = await getStrayServerInstance_LINUX();
            const command = `kill -9 ${strayServerPID}`;
        } else {
            const strayServerPID = await getStrayServerInstance_WINDOWS();
            const command = `taskkill /PID ${strayServerPID} /F`;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`Process with PID ${strayServerPID} killed successfully`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        serverStatus = consts.serverStatus.OFFLINE;
        deleteServerOutput();
    }
}

function validateMemory() {
    try {
        const launchConfig = require("../server-config.json");
        const availableMemory = Math.floor(freemem() / 1048576);
        if (availableMemory > parseInt(launchConfig["memory"].replace("M",""))) {
            console.log(`${launchConfig["memory"]} Available for use!`);
            
            return true;
        } else {
            console.log(`${launchConfig["memory"]} not available for use!`);
            
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function startServer() {
    if (!validateMemory())
        throw new Error("Not enough memory for server to run");
    
    const command = 'java';
    const mem = configUtils.getConfigJSON()["memory"];
    const args = [`-Xmx${mem}M`, `-Xms${Number(mem) / 2}M`, '-jar', consts.serverName, 'nogui'];

    serverProcess = spawn(command, args, {
        cwd: consts.serverDirectory, // Set the working directory
        stdio: ['pipe', 'pipe', 'pipe'], // Use pipes for stdin, stdout, and stderr
      });
    
    fs.writeFileSync(consts.serverLogsFilePath, '');

    serverProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        fs.appendFileSync(consts.serverLogsFilePath, data);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });
}

async function startServerWithScript() {
    if (!validateMemory())
        throw new Error("Not enough memory for server to run");

    serverProcess = spawn('sh', ['start.sh'], {
        cwd: consts.serverDirectory,
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    fs.writeFileSync(consts.serverLogsFilePath, '');

    serverProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        fs.appendFileSync(consts.serverLogsFilePath, data);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });
}

async function doesServerJarAlreadyExist() {
    return fs.existsSync("../server/server.jar");
}

function getServerProcess() {
    return serverProcess;
}

module.exports = {
    isServerOn,
    getStrayServerInstance_WINDOWS,
    getStrayServerInstance_LINUX,
    startServer,
    isServerStarting,
    doesServerJarAlreadyExist,
    getServerlogs,
    runMCCommand,
    killStrayServerInstance,
    signEULA,
    isEULAsigned,
    startServerWithScript,
    serverStatus,
    deleteServerOutput,
    getServerProcess
};