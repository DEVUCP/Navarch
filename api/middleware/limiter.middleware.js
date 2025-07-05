const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    max: 100, // maximum of 10 requests per window (15 sec) 
    windowMs:  15 * 1000, // Window : 15 seconds
    message: "You are being rate-limited.",
    headers: {
        "Retry-After": 15
    }
});

module.exports = {
    limiter
}