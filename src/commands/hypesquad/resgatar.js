const { SlashCommandBuilder } = require("discord.js");
const { panelComponents, v2Flags } = require("../../utils/components");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pd")
        .setDescription("Abre o painel HypeSquad Changer para gerenciar sua insígnia."),
    async execute(interaction) {
        await interaction.reply({
            components: panelComponents(),
            flags: v2Flags,
            allowedMentions: { parse: [] },
        });
    },
};
