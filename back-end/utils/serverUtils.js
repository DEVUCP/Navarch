const { spawn, exec } = require('child_process');
const fs = require('fs');
const consts = require("../consts");

let serverProcess = null;

async function isServerOn() {
    try {
        const serverPID = await getStrayServerInstance();
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
        if(await !isServerOn()){
            throw new Error("Can't run command, server is offline.")
        }
        serverProcess.stdin.write(`${command}\n`);
    } catch(error){
        console.error(error);
    }

}


async function getStrayServerInstance() {
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
                        const match = netstatOutput.match(/TCP\s+.*:25565\s+.*\s+LISTENING\s+(\d+)/i);
                        if (match) {
                            resolve(parseInt(match[1]));
                        } else {
                            reject('No Minecraft server found on port 25565');
                        }
                    }
                });
            } else {
                reject('No Minecraft server found with java.exe');
            }
        });
    });
}

async function killStrayServerInstance() {
    try {
        const strayServerPID = await getStrayServerInstance();
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

// Function to start the server
async function startServer() {
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

// Function to download server files
async function downloadServerFiles(version) {
    try {
        const build = await fetchLatestBuild(version);
        const response = await fetch(
            `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`
        );

        if (response.ok) {
            const fileName = `${consts.serverDirectory}/${consts.serverName}`;
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(fileName, buffer);
            console.log(`Downloaded ${fileName}`);
        } else {
            console.log(`Failed to download build ${build} for version ${version}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// Function to fetch the latest build for a version
async function fetchLatestBuild(version) {
    const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`);
    const jsonBuildData = await response.json();
    return jsonBuildData.builds.at(-1).build;
}

async function doesServerJarAlreadyExist() {
    return fs.existsSync("../server/server.jar");
}

module.exports = {
    isServerOn,
    getStrayServerInstance,
    killStrayServerInstance,
    startServer,
    downloadServerFiles,
    fetchLatestBuild,
    doesServerJarAlreadyExist,
    getServerlogs,
    runMCCommand,
};