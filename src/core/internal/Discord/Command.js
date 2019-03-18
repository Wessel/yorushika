module.exports = class WumpCommand {
  constructor(bot, opts = {}) {
    this.bot     = bot;
    this.extData = Object.assign({
      // Information
      path       : undefined, // The config path of the command [`yorushika.utility.ping` for example] ( optional )
      name       : null,      // Command name        ( required )
      syntax     : null,      // Command syntax      ( optional )
      bearer     : 'yorushika',    // Command bearer      ( required )
      aliases    : [],        // Command aliases     ( optional )
      argument   : [],        // Command arguments   ( optional )
      description: null,      // Command description ( optional )
      // Checks
      hidden     : false,     // Hidden from view    ( true / false )
      enabled    : true,      // Enabled or disabled ( true / false )
      cooldown   : 1000,      // Command cooldown    ( optional )
      category   : 'General', // Command category    ( required )
      ownerOnly  : false,     // Owner only          ( true / false )
      guildOnly  : false,     // Guild only          ( true / false )
      permissions: []         // Bot permissions     ( optional )
    }, opts);

    this.static = {};
    this.mutable = {};
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