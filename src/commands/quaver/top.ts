import { user, modes } from "quaver-api-wrapper";
import { getUsername } from "../../utils/getUsername";
import { topEmbed } from "../../commands-embeds/topEmbed";
import { EmbedBuilder, Message } from "discord.js";

async function run(message: Message, args: any[], index: number, keys: number, mode: "Key4" | "Key7", options: any) {
  let username = await getUsername(message, args);
  if (!username) {
    const embed = new EmbedBuilder().setColor("Blue").setTitle("There was an Error.").setDescription(`Error: Either provide a username or link your account to the bot using \`link\``);
    return message.channel.send({ embeds: [embed] });
  }

  let profile = await user.details(username);
  const plays = await user.scores(profile.info.id, { mode: modes[mode], type: "best" });
  if (plays.length === 0) {
    const embed = new EmbedBuilder().setColor("Blue").setDescription(`${profile.info.username} has no plays.`);
    return message.channel.send({ embeds: [embed] });
  }

  if (plays[0].status === 404) {
    const embed = new EmbedBuilder().setColor("Blue").setTitle("There was an Error.").setDescription(plays[0].error);
    return message.channel.send({ embeds: [embed] });
  }

  const embed = topEmbed(profile, plays, index, keys, options);
  message.channel.send({ embeds: [embed] });
}

module.exports = {
  name: "top",
  aliases: ["top", "tops", "t", "top4k", "tops4k", "t4k", "top7k", "tops7k", "t7k"],
  cooldown: 1000,
  run: async ({ message, args, index, commandName }: { message: Message; args: any[]; index: number | null; commandName: string }) => {
    let keys = 4;
    let mode: "Key4" | "Key7" = "Key4";

    if (commandName.includes("7k")) {
      keys = 7;
      mode = "Key7";
    }

    let options: any = {};
    for (const arg of args) {
      const [key, value] = arg.split("=");
      if (key && value) {
        options[key] = value;
      }
    }

    await run(message, args, index - 1 || 0, keys, mode, options);
  },
};
