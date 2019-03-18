const { DiscordCommand } = require('../../core');

module.exports = class name extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      path        : undefined,
      name        : '',
      syntax      : '',
      bearer      : 'yorushika',
      aliases     : [],
      argument    : [],
      description: '',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Utility',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: []
    });

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args, user, guild) {
    // ...
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      // ...
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};