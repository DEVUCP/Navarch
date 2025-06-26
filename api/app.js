const express = require('express');
const cors = require('cors');
const { limiter } = require('./middleware/limiter.middleware');

const app = express();

const adminRoutes = require('./routes/adminRoutes');
const serverRoutes = require('./routes/serverRoutes'); // Routes are separated
const propertiesRoute = require('./routes/propertiesRoutes'); // Routes are separated
const installationsRoutes = require('./routes/installationsRoutes'); // Routes are separated

app.use(cors());
app.use(limiter)
app.use(express.json());

app.use('/server', serverRoutes);
app.use('/installations', installationsRoutes);
app.use('/properties', propertiesRoute);
app.use('/admin', adminRoutes);

app.get('/ping', async (req, res) => {
    res.send(`pong`);
});

module.exports = {
    app
}