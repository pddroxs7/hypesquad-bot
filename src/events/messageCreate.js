const { Events } = require("discord.js");
const logger = require("../utils/logger");
const { panelComponents } = require("../utils/components");

module.exports = {
    name: Events.MessageCreate,
    async execute(client, message) {
        if (message.author.bot) return;

        const content = message.content.trim().toLowerCase();
        const isTrigger = content === "hype" || content === "!hype" || content === "hypesquad";

        if (!isTrigger) return;

        try {
            await message.channel.send({
                ...panelComponents(client),
                allowedMentions: { parse: [] },
            });
            logger.info(`Painel enviado no canal ${message.channel.id} por ${message.author.tag}`);
        } catch (error) {
            logger.error(`Falha ao enviar o painel: ${error.message}`);
            return;
        }

        try {
            if (message.deletable) await message.delete();
        } catch (error) {
            logger.warn(`Não foi possível apagar a mensagem de ${message.author.tag}: ${error.message}`);
        }
    },
};
