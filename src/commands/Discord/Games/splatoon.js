/*
  m = Maps
  r = Request
  w = Wumpfetch
*/

const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');
const l = require('larg');
const s = require('../../../util/smartSearch');

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
      cooldown   : 1000,
      category   : 'Games',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
    
    this.mutable.BASE_URL = 'https://splatoon.ink';
    this.mutable.REQ_DATA = {
      headers: {
        'User-Agent': this.bot.ua
      }
    };
  }

  async execute(msg, args) {
      let r = await w(`${this.mutable.BASE_URL}/schedule2.json`, this.mutable.REQ_DATA).send();
      r = r.json();
      
      msg.channel.createMessage(this._localize(msg.author.locale.games.splatoon.join('\n'), { maps: r }));
  }

  _localize(msg, extData) {
    if (extData && extData.maps) {
      const m = extData.maps;
      return msg
      .replace(/\$\[maps:turf@first]/g, m.modes.regular[0].maps[0])
      .replace(/\$\[maps:ranked@first]/g, m.modes.gachi[0].maps[0])
      .replace(/\$\[maps:league@first]/g, m.modes.league[0].maps[0])
      .replace(/\$\[maps:turf@second]/g, m.modes.regular[0].maps[1])
      .replace(/\$\[maps:ranked@second]/g, m.modes.gachi[0].maps[1])
      .replace(/\$\[maps:league@second]/g, m.modes.league[0].maps[1]);
    }

    return msg;
  }
};

