const express = require('express');
const app = express();
const fs = require('fs');

app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

app.get('/start', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

app.get('/download/:version', async (req, res) => {
    await downloadServerFiles(req.params.version);
    res.status(201)
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
            const fileName = `../server/paper-${version}-${build}.jar`;
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
    const response = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`)
    const jsonBuildData = await response.json()
    return jsonBuildData.builds.at(-1).build;
}