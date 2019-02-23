const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Splatoon extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'splatoon',
      syntax     : 'splatoon',
      aliases    : [],
      argument   : [],
      description: 'Get splatoon\'s current maps',

      hidden     : false,
      enabled    : true,
      cooldown   : 2000,
      category   : 'Games',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: []
    });
    
    this.static = {
      BASE_URL: 'https://splatoon.ink',
      REQ_DATA: {
        headers: {
          'User-Agent': this.bot.ua
        }
      }
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg) {
      const req = await w(`${this.mutable.BASE_URL}/schedule2.json`, this.static.REQ_DATA).send();
      const res = req.json();
      
      msg.channel.createMessage(this._localize(msg.author.locale.games.splatoon.join('\n'), res));
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        return msg
          .replace(/\$\[maps:turf@first]/g, extData.modes.regular[0].maps[0])
          .replace(/\$\[maps:turf@second]/g, extData.modes.regular[0].maps[1])
          .replace(/\$\[maps:ranked@first]/g, extData.modes.gachi[0].maps[0])
          .replace(/\$\[maps:league@first]/g, extData.modes.league[0].maps[0])
          .replace(/\$\[maps:ranked@second]/g, extData.modes.gachi[0].maps[1])
          .replace(/\$\[maps:league@second]/g, extData.modes.league[0].maps[1]);
      }

      return msg;
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};