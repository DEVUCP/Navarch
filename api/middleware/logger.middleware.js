module.exports = (req, res, next) => {
  const colors = {
    GET: '\x1b[32m',    // Green
    POST: '\x1b[33m',   // Yellow
    PUT: '\x1b[34m',    // Blue
    PATCH: '\x1b[35m',
    DELETE: '\x1b[31m', // Red
    RESET: '\x1b[0m'    // Reset color
  };
  const color = colors[req.method] || colors.RESET;
//   console.log(
//     `${color}[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']}${colors.RESET}`
//   );
  console.log(
    `${color}[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}${colors.RESET}`
  );
  next();
};
