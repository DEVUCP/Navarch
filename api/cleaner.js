let cleanup_done = false;
const networkingUtils = require('./utils/networkingUtils');
const configUtils = require('./utils/configUtils');
const debug = configUtils.getConfigAttribute("debug");

async function cleanup() {
    if(debug){
        console.log("\nDebug mode is turned on\n Skipping cleanup tasks...\n if you don't intend this, change 'debug' from true to false in server-config.json");
        console.log("====== API TERMINATED! ======");
        cleanup_done = true;
        return;
    }

    console.log('\nRunning cleanup tasks...');

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(3000);

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(3001);

    console.log('Removing port mapping ...');
    await networkingUtils.removePortMapping(configUtils.getConfigAttribute("port"));
}

process.on('exit', () => {
    if (!cleanup_done) 
        cleanup();
});

async function handleExit() {
    await cleanup();
    process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await cleanup();
    process.exit(1);
});
