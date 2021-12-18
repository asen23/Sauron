const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Say hello to Sauron'),
    async execute(interaction) {
        await interaction.reply({
            content: `Hello ${interaction.user.username}`,
            ephemeral: true,
        });
    },
};
