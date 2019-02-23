const { DiscordCommand } = require('../../../core');

const w         = require('wumpfetch');
const larg      = require('larg');
const { table } = require('table');
module.exports = class Stats extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'commits',
      syntax     : 'commits',
      aliases    : [],
      argument   : [],
      description: '10 most recent commits',

      hidden     : false,
      enabled    : true,
      cooldown   : 5000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      BASE_URL: 'https://api.github.com',
      REQ_DATA: {
        headers: {
          'User-Agent'   : this.bot.ua,
          'Authorization': this.bot.conf.api.dbl
        }
      },
      TABLE_CONFIG: {
        border: {
            topBody: `-`,
            topJoin: `+`,
            topLeft: `+`,
            topRight: `+`,

            bottomBody: `-`,
            bottomJoin: `+`,
            bottomLeft: `+`,
            bottomRight: `+`,

            bodyLeft: `|`,
            bodyRight: `|`,
            bodyJoin: `|`,

            joinBody: `-`,
            joinLeft: `+`,
            joinRight: `+`,
            joinJoin: `+`
        },
        drawHorizontalLine: (_, s) => {
            return _ === 0 || _ === 1 || _ === s;
        }
      }
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
    let res = await w(`${this.static.BASE_URL}/repos/PassTheWessel/wump/commits`, this.static.REQ_DATA).send();
        res = res.json();
    
    if (larg(args)['raw'] || larg(args)['r']) {
      let data = [ [ 'Hash', 'Message' ] ];
      res.map((v) => data.push([ v.sha.slice(0, 7), this.bot.util.shorten(v.commit.message.replace(/\n/g, ' '), 80) ]));
      msg.channel.createMessage(`\`\`\`${table(data.slice(0, 11), this.static.TABLE_CONFIG)}\`\`\``);
    } else {
      msg.channel.createMessage({
        embed: {
          color: this.bot.col.info.commits,
          description: this._localize(msg.author.locale.info.commits, { commits: res.map((v) => `**•** [\`${v.sha.slice(0, 7)}\`](${v.html_url}) **⤏** ${this.bot.util.shorten(v.commit.message, 80)}`).slice(0, 10).join('\n') })
        }
      });
    }
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      return msg
        .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'commits', '0'))
        .replace(/\$\[commits:list]/g, `\n${extData.commits}`);
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};