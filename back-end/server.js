const express = require('express');
const { spawn } = require('child_process');
const app = express();
const fs = require('fs');
const os = require("os");

const serverDirectory = "../server"
const serverName = "server.jar"
const serverLogsFilePath = `${serverDirectory}/server_output.txt`



app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
    console.log(Math.floor(os.freemem()/1000000));
});



app.get('/download/:version', async (req, res) => {
    await downloadServerFiles(req.params.version);
    res.status(201)
});

let serverProcess = null;

// Start route
app.get('/start', (req, res) => {
    if (serverProcess) {
        return res.status(400).send('Server is already running.');
    }

    // Define the shell command you want to run
    const command = 'java';
    const args = ['-Xmx1024M', '-Xms1024M', '-jar', serverName, 'nogui'];

    // Execute the command
    serverProcess = spawn(command, args, { cwd: '../server' });


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
app.get('/stop', (req, res) => {
    if (!serverProcess) {
        return res.status(400).send('Server is not running.');
    }

    // Kill the process
    serverProcess.stdin.write('stop\n');

    // Respond immediately
    res.send('Server stopped.');
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