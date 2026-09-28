const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
} = require("discord.js");

function separator() {
    return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function text(content) {
    return new TextDisplayBuilder().setContent(content);
}

function panelComponents() {
    const gearButton = new ButtonBuilder()
        .setCustomId("hypesquad_config_token")
        .setEmoji("⚙️")
        .setStyle(ButtonStyle.Secondary);

    const headerSection = new SectionBuilder()
        .addTextDisplayComponents(text("**HypeSquad Changer**"))
        .addTextDisplayComponents(text("Gerencie sua insígnia do **HypeSquad** de forma rápida e fácil."))
        .setButtonAccessory(gearButton);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("hypesquad_select")
        .setPlaceholder("Escolha uma casa do HypeSquad...")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Bravery")
                .setDescription("Trocar para HypeSquad Bravery")
                .setValue("bravery")
                .setEmoji({ id: "1526048175260176464" }),
            new StringSelectMenuOptionBuilder()
                .setLabel("Brilliance")
                .setDescription("Trocar para HypeSquad Brilliance")
                .setValue("brilliance")
                .setEmoji({ id: "1526048295984693359" }),
            new StringSelectMenuOptionBuilder()
                .setLabel("Balance")
                .setDescription("Trocar para HypeSquad Balance")
                .setValue("balance")
                .setEmoji({ id: "1526048253760508099" }),
            new StringSelectMenuOptionBuilder()
                .setLabel("Remover Insígnia")
                .setDescription("Remover sua insígnia do HypeSquad")
                .setValue("remove")
                .setEmoji("🗑️"),
        );

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    const container = new ContainerBuilder()
        .addSectionComponents(headerSection)
        .addSeparatorComponents(separator())
        .addActionRowComponents(selectRow);

    return [container];
}

function statusComponents({ type, title, description, details }) {
    const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

    const container = new ContainerBuilder()
        .addTextDisplayComponents(text(`# ${icons[type] || icons.info} ${title}`))
        .addTextDisplayComponents(text(description));

    if (details) {
        container.addSeparatorComponents(separator()).addTextDisplayComponents(text(details));
    }

    return [container];
}

const houseNames = { bravery: "Bravery", brilliance: "Brilliance", balance: "Balance", remove: "Remover Insígnia" };

function houseLabel(house) {
    return houseNames[house] || house;
}

module.exports = {
    houseLabel,
    panelComponents,
    statusComponents,
    v2Flags: MessageFlags.IsComponentsV2,
    v2PrivateFlags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
};
