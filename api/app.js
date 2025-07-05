const express = require('express');
const cors = require('cors');
const { limiter } = require('./middleware/limiter.middleware');

const app = express();

const adminRoutes = require('./routes/admin.routes');
const serverRoutes = require('./routes/server.routes');
const propertiesRoute = require('./routes/properties.routes');
const installationsRoutes = require('./routes/installations.routes');
const infoRoutes = require('./routes/info.routes');

app.use(cors());
app.use(limiter)
app.use(express.json());

app.use('/server', serverRoutes);
app.use('/installations', installationsRoutes);
app.use('/properties', propertiesRoute);
app.use('/info', infoRoutes);
app.use('/admin', adminRoutes);

app.get('/ping', async (req, res) => {
    res.send(`pong`);
});

module.exports = {
    app
}