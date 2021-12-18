const { Client, Intents } = require('discord.js');
require('dotenv').config();

const { testGuildId, token } = {
    testGuildId: process.env.TEST_GUILD_ID,
    token: process.env.TOKEN,
};

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    console.log('Ready!');
    const testGuild = client.guilds.cache.get(testGuildId);
    // This takes ~1 hour to update
    client.application.commands.set([]);
    // This updates immediately
    testGuild.commands.set([]);
});

client.login(token);
