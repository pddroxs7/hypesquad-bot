const time = () => `\x1b[90m${new Date().toLocaleTimeString()}\x1b[0m`;

const logger = {
    info: (message) => console.log(`${time()} \x1b[36mℹ\x1b[0m ${message}`),
    success: (message) => console.log(`${time()} \x1b[32m✓\x1b[0m ${message}`),
    warn: (message) => console.log(`${time()} \x1b[33m⚠\x1b[0m ${message}`),
    error: (message) => console.log(`${time()} \x1b[31m✗\x1b[0m ${message}`),
};

module.exports = logger;
