module.exports = class WumpCommand {
  constructor(bot, opts = {}) {
    this.bot     = bot;
    this.extData = Object.assign({
      // Information
      name        : null,      // Command name        ( required )
      syntax      : null,      // Command syntax      ( optional )
      aliases     : [],        // Command aliases     ( optional )
      argument    : [],        // Command arguments   ( optional )
      description: null,      // Command description ( optional )
      // Checks
      hidden      : false,     // Hidden from view    ( true / false )
      enabled     : true,      // Enabled or disabled ( true / false )
      cooldown    : 1000,      // Command cooldown    ( optional )
      category    : 'General', // Command category    ( required )
      ownerOnly   : false,     // Owner only          ( true / false )
      guildOnly   : false,     // Guild only          ( true / false )
      permissions : []         // Bot permissions     ( optional )
    }, opts);

    this.static  = {};
    this.mutable = {};
    Object.freeze(this.static);
  }

  async execute(msg, args, user, guild) {}

  _localize(msg) {}
};