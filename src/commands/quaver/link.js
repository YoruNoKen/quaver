const { user } = require("quaver-api-wrapper");
const { getUsername } = require("../../utils/getUsername");
const { EmbedBuilder, Message } = require("discord.js");
const { query } = require("../../utils/getQuery.js");

/**
 *
 * @param {Message} message
 * @param {string} args
 * @returns
 */
async function run(message, args) {
  let username = await getUsername(message, args);
  if (!username) {
    const embed = new EmbedBuilder().setColor("Blue").setTitle("There was an Error.").setDescription(`Error: Either provide a username or link your account to the bot using \`link\``);
    return message.channel.send({ embeds: [embed] });
  }

  const profile = await user.details(username);
  if (profile.status === 404) {
    const embed = new EmbedBuilder().setColor("Blue").setTitle("There was an Error.").setDescription(profile.error);
    return message.channel.send({ embeds: [embed] });
  }
  let id = profile.info.id;

  const qUser = await query({ query: `SELECT * FROM users WHERE id = ?`, parameters: [message.author.id], type: "get" });
  if (!qUser) {
    await query({ query: `INSERT INTO users (id, value) VALUES (?, json_object('UserId', ?))`, parameters: [message.author.id, id], type: "run" });
  } else {
    const q = `UPDATE users
    SET value = json_set(value, '$.UserId', ?)
    WHERE id = ?`;
    await query({ query: q, parameters: [id, message.author.id], type: "run" });
  }

  const embed = new EmbedBuilder().setTitle("Account Linked").setColor("Blue").setDescription(`Successfully linked your account to \`${profile.info.username}\` with the ID of \`${profile.info.id}\``).setThumbnail(profile.info.avatar_url);
  return message.channel.send({ embeds: [embed] });
}

module.exports = {
  name: "link",
  aliases: ["link"],
  cooldown: 1000,
  run: async ({ message, args }) => {
    await run(message, args);
  },
};
