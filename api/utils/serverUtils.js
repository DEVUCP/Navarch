const { spawn, exec } = require('child_process');
const fs = require('fs');
const consts = require("../consts");
const {freemem} = require('os');
const {getConfigAttribute} = require("./configUtils");

let serverProcess = null;

async function isServerOn() {
    try {
        const serverPID = getConfigAttribute("os") != "Linux" ? await getStrayServerInstance_WINDOWS() : await getStrayServerInstance_LINUX();
        return !!serverPID;
    } catch (error) {
        return false;
    }
}

function getServerlogs() {
    try {
        return fs.readFileSync(consts.serverLogsFilePath, { encoding: 'utf8', flag: 'r' })
    } catch (error) {
        return null;
    }
}

async function runMCCommand(command) {
    try{
        if(!isServerOn()){
            throw new Error("Can't run command, server is offline.")
        }
        serverProcess.stdin.write(`${command}\n`);
    } catch(error){
        console.error(error);
    }

}

async function killStrayServerInstance(){
    switch(getConfigAttribute("os")){
        case "Windows_NT":
            await killStrayServerInstance_WINDOWS();
            break;
        case "Linux":
            await killStrayServerInstance_LINUX();
            break;

        case _:
            await killStrayServerInstance_LINUX();
            break;
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
            if (code !== 0) {
                reject(`tasklist command failed with code ${code}`);
            } else if (output.includes('java.exe')) {
                const netstat = spawn('netstat', ['-ano']);

                let netstatOutput = '';
                netstat.stdout.on('data', (data) => {
                    netstatOutput += data.toString();
                });

                netstat.stderr.on('data', (data) => {
                    reject(`Error in netstat: ${data.toString()}`);
                });

                netstat.on('close', (code) => {
                    if (code !== 0) {
                        reject(`netstat command failed with code ${code}`);
                    } else {

                        const port = getConfigAttribute("port");
                        const regex = new RegExp(`TCP\\s+.*:${port}\\s+.*\\s+LISTENING\\s+(\\d+)`, 'i');
                        const match = netstatOutput.match(regex);
                                             
                        if (match) {
                            resolve(parseInt(match[1]));
                        } else {
                            reject(`No Minecraft server found on port ${port}`);
                        }
                    }
                });
            } else {
                reject('No Minecraft server found with java.exe');
            }
        });
    });
}

async function killStrayServerInstance_WINDOWS() {
    try {
        const strayServerPID = await getStrayServerInstance_WINDOWS();
        const command = `taskkill /PID ${strayServerPID} /F`;

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
    }
}


function getStrayServerInstance_LINUX() {
    return new Promise((resolve, reject) => {
        // Use 'ps' to find Java processes
        const ps = spawn('ps', ['-C', 'java', '-o', 'pid=']);

        let output = '';
        ps.stdout.on('data', (data) => {
            output += data.toString();
        });

        ps.stderr.on('data', (data) => {
            reject(`Error in ps: ${data.toString()}`);
        });

        ps.on('close', (code) => {
            if (code !== 0) {
                reject(`ps command failed with code ${code}`);
            } else if (output.trim()) {
                // Use 'ss' to find processes listening on port 25565
                const ss = spawn('ss', ['-tlnp']);

                let ssOutput = '';
                ss.stdout.on('data', (data) => {
                    ssOutput += data.toString();
                });

                ss.stderr.on('data', (data) => {
                    reject(`Error in ss: ${data.toString()}`);
                });

                ss.on('close', (code) => {
                    if (code !== 0) {
                        reject(`ss command failed with code ${code}`);
                    } else {
                        // Find the process listening on port 25565
                        const port = getConfigAttribute("port");
                        const regex = new RegExp(`TCP\\s+.*:${port}\\s+.*\\s+LISTENING\\s+(\\d+)`, 'i');
                        const match = netstatOutput.match(regex);                        if (match) {
                            resolve(parseInt(match[1]));
                        } else {
                            reject(`No Minecraft server found on port ${port}`);
                        }
                    }
                });
            } else {
                reject('No Minecraft server found with java process');
            }
        });
    });
}

async function killStrayServerInstance_LINUX() {
    try {
        const strayServerPID = await getStrayServerInstance_LINUX();
        const command = `kill -9 ${strayServerPID}`;

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
    }
}



function validateMemory(){
    try {
        
        const launchConfig = require("../server-config.json");
        const availableMemory = Math.floor(freemem() / 1048576);
        if(availableMemory > parseInt(launchConfig["memory"].replace("M",""))){

            console.log(`${launchConfig["memory"]} Available for use!`);
            return true;
        }else{
            console.log(`${launchConfig["memory"]} not available for use!`);
            return false;

        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function startServer() {
    if(!validateMemory()){
        throw new Error("Not enough memory for server to run");
    }
    const command = 'java';
    const args = ['-Xmx1024M', '-Xms1024M', '-jar', consts.serverName, 'nogui'];

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

async function doesServerJarAlreadyExist() {
    return fs.existsSync("../server/server.jar");
}

module.exports = {
    isServerOn,
    getStrayServerInstance_WINDOWS,
    getStrayServerInstance_LINUX,
    killStrayServerInstance_WINDOWS,
    killStrayServerInstance_LINUX,
    startServer,
    doesServerJarAlreadyExist,
    getServerlogs,
    runMCCommand,
    killStrayServerInstance,
};