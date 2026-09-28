const { Events } = require("discord.js");
const logger = require("../utils/logger");
const deployCommands = require("../../deploy-commands");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.success(`Bot online e pronto!`);
        await deployCommands();
    },
};
