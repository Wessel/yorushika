const { DiscordCommand } = require('../../../core');

module.exports = class name extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : '',
      syntax      : '',
      aliases     : [],
      argument    : [],
      description: '',

      hidden      : false,
      enabled     : true,
      cooldown    : 1000,
      category    : 'Utility',
      ownerOnly   : false,
      guildOnly   : false,
      permissions : [ 'embedLinks' ]
    });
  }

  async execute(msg, args, user, guild) {}

  _localize(msg) {}
};