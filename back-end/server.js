const express = require('express');
const { spawn, exec } = require('child_process');
const app = express();
const fs = require('fs');
const os = require("os");
const { stdout } = require('process');
const cors = require('cors');
app.use(cors());

const serverDirectory = "../server"
const serverName = "server.jar"
const serverLogsFilePath = `${serverDirectory}/server_output.txt`

app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
    console.log(Math.floor(os.freemem()/1000000));
});



app.get('/download/:version', async (req, res) => {
    await downloadServerFiles(req.params.version);
    res.status(201);
    res.send("Downloaded Successfully");
});


// Function to check if the server is running
async function isServerOn() {
    try {
        // Get the PID of the stray Minecraft server instance
        const serverPID = await getStrayServerInstance();
        if (serverPID) return true;
        else return false;
    } catch (error) {
        // console.error("Error in isServerOn:", error);
        return false;  // Return false in case of any error
    }
}

// Function to find the stray Minecraft server instance
async function getStrayServerInstance() {
    return new Promise((resolve, reject) => {
        // Spawn a child process to run the "tasklist" command
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
            } else {
                if (output.includes('java.exe')) {
                    // Spawn the "netstat" command to find the associated PID using a port (25565 default for Minecraft)
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
                            // Search for the process using port 25565
                            const match = netstatOutput.match(/TCP\s+.*:25565\s+.*\s+LISTENING\s+(\d+)/i);
                            if (match) {
                                const pid = match[1];  // Extract PID
                                resolve(parseInt(pid));
                            } else {
                                reject('No Minecraft server found on port 25565');
                            }
                        }
                    });
                } else {
                    reject('No Minecraft server found with java.exe');
                }
            }
        });
    });
}



async function killStrayServerInstance(){
    try{
        const strayServerPID = await getStrayServerInstance();
    
        command = `taskkill /PID ${strayServerPID} /F`
    
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

    } catch(error){
        console.error(error);
    }
}






// Start route
app.get('/start', async (req, res) => {
    if (await isServerOn()) {
        return res.status(400).send('Server is already running.');
    }

    // Define the shell command you want to run
    const command = 'java';
    const args = ['-Xmx1024M', '-Xms1024M', '-jar', serverName, 'nogui'];

    // Execute the command
    let serverProcess = spawn(command, args, { cwd: '../server' });


    fs.writeFileSync(serverLogsFilePath,"")

    // Log output to the console (optional)
    serverProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        fs.appendFileSync(serverLogsFilePath, data);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Handle process exit
    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        serverProcess = null; // Reset the process variable
    });

    // Respond immediately
    res.send('Server started.');
});

// Stop route
app.get('/stop', async (req, res) => {
    
    try{
        if (!isServerOn()) {
            return res.status(400).send('Server is not running.');
        }
        else{
        await killStrayServerInstance()
        res.status(200).send("server stopped.")
    }
    }catch(error){
        console.error(error)
        res.status(500).send("Failed to stop server")
    }

});

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function handleDownloadServerFiles(version){

}


async function downloadServerFiles(version){
    try{
        const build = await fetchLatestBuild(version);
        console.log(build);
        const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`)
        console.log(response)
        
        if (response.ok) {
            const fileName = serverDirectory + serverName;
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(fileName, buffer);
            console.log(`Downloaded ${fileName}`);
        } else {
            console.log(`Failed to download build ${build} for version ${version}`);
        }
    }
    catch(error){
        console.error(error)
    }

}

async function fetchLatestBuild(version){
    const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`);
    const jsonBuildData = await response.json();
    return jsonBuildData.builds.at(-1).build;
}