const { DiscordEvent } = require('../../core');

module.exports = class MessageDelete extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'messageDelete' });
  }

  emit(msg) {
    if (!msg.channel.guild || !msg.author || !this.bot.ready) return;
    this.bot.cache.set(`${msg.channel.id}:SNIPE`, msg);
  }
};