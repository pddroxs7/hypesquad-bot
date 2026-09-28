const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const logger = require("./src/utils/logger");

const commands = [];
const commandsPath = path.join(__dirname, "src/commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, folder, file);
        const command = require(filePath);

        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            logger.warn(`Comando ignorado por estrutura inválida: ${filePath}`);
        }
    }
}

module.exports = async () => {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        logger.info(`Atualizando ${commands.length} comando(s) de barra.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        logger.success(`Comandos atualizados com sucesso: ${data.length}.`);
    } catch (error) {
        logger.error(`Falha ao atualizar comandos: ${error.message}`);
    }
};
