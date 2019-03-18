const { DiscordEvent } = require('../../core');

const { green, cyan } = require('../../util/colors');

module.exports = class Disconnect extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'disconnect' });
  }

  emit() {
    this.bot.print(1, `${cyan('Discord')} >> All websockets disconnected from ${green(`${this.bot.user.username}#${this.bot.user.discriminator}`)}`);
  }
};