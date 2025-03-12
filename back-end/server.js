const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const serverRoutes = require('./routes/serverRoutes'); // Routes are separated
const propertiesRoute = require('./routes/propertiesRoutes'); // Routes are separated


const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/server', serverRoutes);
app.use('/properties', propertiesRoute);

// Default route
app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
    console.log(`Free memory: ${Math.floor(os.freemem() / 1000000)} MB`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});