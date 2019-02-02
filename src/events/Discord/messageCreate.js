const { DiscordEvent } = require('../../core');

module.exports = class MessageCreate extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'messageCreate' });
  }

  async emit(msg) {
    this.bot.commandRegistry.handleCommand(msg);
  }
};