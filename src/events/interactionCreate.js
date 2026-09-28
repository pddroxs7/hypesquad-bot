const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const axios = require("axios");
const logger = require("../utils/logger");
const { houseLabel, statusComponents, v2PrivateFlags } = require("../utils/components");

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                logger.error(`Comando não encontrado: ${interaction.commandName}`);
                return interaction.reply({ components: statusComponents({ type: "error", title: "Comando indisponível", description: "Este comando não foi carregado corretamente.", details: "Tente novamente em alguns instantes." }), flags: v2PrivateFlags });
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Falha ao executar ${interaction.commandName}: ${error.message}`);
                const payload = { components: statusComponents({ type: "error", title: "Erro ao executar comando", description: "Não consegui concluir esta ação agora.", details: "Tente novamente em alguns instantes." }), flags: v2PrivateFlags };
                if (interaction.replied || interaction.deferred) { await interaction.followUp(payload); } else { await interaction.reply(payload); }
            }
            return;
        }

        if (interaction.isButton() && interaction.customId === "hypesquad_config_token") {
            const modal = new ModalBuilder().setCustomId("hypesquad_token_config_modal").setTitle("Configurar Token HypeSquad");
            const tokenInput = new TextInputBuilder().setCustomId("hypesquad_token_input").setLabel("Seu User Token do Discord").setStyle(TextInputStyle.Short).setPlaceholder("Cole seu token aqui").setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(tokenInput));
            await interaction.showModal(modal);
            return;
        }

        if (interaction.isModalSubmit() && interaction.customId === "hypesquad_token_config_modal") {
            const userToken = interaction.fields.getTextInputValue("hypesquad_token_input").trim();
            if (!client.userTokens) client.userTokens = new Map();
            client.userTokens.set(interaction.user.id, userToken);
            logger.info(`Token configurado para ${interaction.user.tag}`);
            await interaction.reply({ components: statusComponents({ type: "success", title: "Token configurado", description: "Seu token foi salvo com sucesso.", details: "Agora escolha uma casa no menu do painel." }), flags: v2PrivateFlags });
            return;
        }

        if (interaction.isStringSelectMenu() && interaction.customId === "hypesquad_select") {
            const selectedHouse = interaction.values[0];
            const userToken = client.userTokens?.get(interaction.user.id);
            if (!userToken) {
                return interaction.reply({ components: statusComponents({ type: "error", title: "Token Não Configurado", description: "Você precisa configurar seu token primeiro!", details: "Clique no botão ⚙️ acima e cole seu User Token." }), flags: v2PrivateFlags });
            }
            await interaction.deferReply({ flags: v2PrivateFlags });

            if (selectedHouse === "remove") {
                try {
                    await axios({ method: "DELETE", url: "https://discord.com/api/v9/hypesquad/online", headers: { Authorization: userToken, "Content-Type": "application/json" }, timeout: 15000 });
                    logger.success(`Insígnia removida para ${interaction.user.tag}`);
                    return interaction.editReply({ components: statusComponents({ type: "success", title: "Insígnia removida", description: "Sua insígnia HypeSquad foi removida com sucesso.", details: "Abra seu perfil no Discord para confirmar." }) });
                } catch (error) {
                    return handleHypeSquadError(interaction, error);
                }
            }

            const houses = ["bravery", "brilliance", "balance"];
            const houseId = houses.indexOf(selectedHouse.toLowerCase()) + 1;
            if (!houseId) {
                return interaction.editReply({ components: statusComponents({ type: "error", title: "Casa inválida", description: "A casa selecionada não foi reconhecida.", details: "Abra o painel novamente." }) });
            }

            try {
                const response = await axios({ method: "POST", url: "https://discord.com/api/v9/hypesquad/online", data: { house_id: houseId }, headers: { Authorization: userToken, "Content-Type": "application/json" }, timeout: 15000 });
                if (![200, 204].includes(response.status)) throw new Error(`Status inesperado: ${response.status}`);
                logger.success(`HypeSquad ${selectedHouse} aplicado para ${interaction.user.tag}`);
                await interaction.editReply({ components: statusComponents({ type: "success", title: "Insígnia resgatada", description: `Sua casa foi alterada para **${houseLabel(selectedHouse)}** com sucesso.`, details: "Abra seu perfil no Discord para conferir." }) });
            } catch (error) {
                await handleHypeSquadError(interaction, error);
            }
        }
    },
};

async function handleHypeSquadError(interaction, error) {
    let title = "Não foi possível concluir", description = "Ocorreu um erro ao processar sua solicitação.", details = "Verifique os dados informados e tente novamente.";
    if (error.response?.status === 401) { title = "Token inválido"; description = "O token informado foi recusado pelo Discord."; details = "Clique em ⚙️ para configurar um token válido."; }
    else if (error.response?.status === 400) { title = "Solicitação inválida"; description = "O Discord recusou os dados enviados."; details = "Tente selecionar a casa novamente."; }
    else if (error.code === "ECONNABORTED") { title = "Tempo esgotado"; description = "O Discord demorou demais para responder."; details = "Tente novamente em alguns instantes."; }
    const payload = { components: statusComponents({ type: "error", title, description, details }) };
    if (interaction.deferred || interaction.replied) { await interaction.editReply(payload); } else { await interaction.reply({ ...payload, flags: v2PrivateFlags }); }
              }
