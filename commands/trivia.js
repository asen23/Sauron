const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const fetch = require('node-fetch');
const unescape = require('lodash.unescape');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Give a random trivia question'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const trivia = await getTrivia();
        if (!trivia) {
            interaction.editReply({
                content: 'Failed to get trivia, please try again',
                ephemeral: true,
            });
        }
        const answers = [];
        const answersHighlighted = [];
        const id = [];
        trivia.answers.forEach((answer, i) => {
            answers.push(
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('trivia_ans_' + i)
                        .setLabel(answer)
                        .setStyle('PRIMARY')
                )
            );
            answersHighlighted.push(
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('trivia_ans_highlighted_' + i)
                        .setLabel(answer)
                        .setStyle(
                            answer == trivia.correct_answer
                                ? 'SUCCESS'
                                : 'DANGER'
                        )
                        .setDisabled(true)
                )
            );
            id.push('trivia_ans_' + i);
        });

        const filter = (i) => id.includes(i.customId);

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000,
        });

        collector.on('collect', async (i) => {
            if (
                trivia.answers[i.customId[i.customId.length - 1]] ===
                trivia.correct_answer
            ) {
                await i.update({
                    content: `Correct!\n${trivia.question}\n`,
                    components: answersHighlighted,
                });
            } else {
                await i.update({
                    content: `Wrong!\n${trivia.question}\n`,
                    components: answersHighlighted,
                });
            }
        });

        interaction.editReply({
            content: `Difficulty: ${trivia.difficulty}\nCategory: ${trivia.category}\n${trivia.question}`,
            components: answers,
            ephemeral: true,
        });
    },
};

const getTrivia = async () => {
    const data = await fetch('https://opentdb.com/api.php?amount=1');
    const json = await data.json();
    if (json.results) {
        if (json.results.length === 0) {
            return null;
        }
    }
    const trivia = json.results[0];
    return {
        category: trivia.category,
        difficulty: trivia.difficulty,
        question: unescape(trivia.question),
        correct_answer: trivia.correct_answer,
        answers: shuffleArray([
            ...trivia.incorrect_answers,
            trivia.correct_answer,
        ]),
    };
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
