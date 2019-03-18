const { DiscordCommand } = require('../../../core');

const os               = require('os');
const larg             = require('larg');
const moment           = require('moment'); require('../../../util/moment/format');
const { table }        = require('table');
const { readFileSync } = require('fs');

module.exports = class Stats extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      path       : undefined,
      name       : 'stats',
      syntax     : 'stats [--{no-deps|no-bot|no-sys|no-cpu|no-thumb}]',
      bearer     : 'yorushika',
      aliases    : [ 'statistics' ],
      argument   : [ '[--{no-deps|no-bot|no-sys|no-cpu|no-thumb}]' ],
      description: 'Some small statistics',

      hidden     : false,
      enabled    : true,
      cooldown   : 2500,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      inline: true,
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

    this.mutable.platform = {
      'arch'    : os.arch() ? os.arch() : '32x',
      'cpus'    : os.cpus(),
      'release' : os.release() ? os.release() : '?.?.?',
      'platform': os.platform()
    };

    try {
      this.static.thumb = readFileSync('./assets/img/thumb/stats.png');
    } catch (ex) {
      this.thumb = undefined;
    }

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
          args = larg(args);
    let   fields = [];
    const message = await msg.channel.createMessage(this._localize(msg.author.locale.info.stats.fetching));
    
    switch (this.mutable.platform.platform) {
      case 'aix'    : this.mutable.platform.platform = 'Linux'; break;
      case 'sunos'  : this.mutable.platform.platform = 'Linux'; break;
      case 'win32'  : this.mutable.platform.platform = 'Windows'; break;
      case 'linux'  : this.mutable.platform.platform = 'Linux'; break;
      case 'darwin' : this.mutable.platform.platform = 'Macintosh'; break;
      case 'freebsd': this.mutable.platform.platform = 'Linux'; break;
      case 'openbsd': this.mutable.platform.platform = 'Linux'; break;
      case 'android': this.mutable.platform.platform = 'Android'; break;
      default       : this.mutable.platform.platform = 'Unknown';
    }


    if (args['raw'] || args['r']) {
      fields = {
        raw: true,
        content: [
          [ 'Key', 'Value' ],
          [ 'Shards [C / T]', `${msg.channel.guild.shard.id} / ${this.bot.shards.size}` ],
          [ 'Cache [U / G]', `${this.bot.cache.get('users').length || 0} / ${this.bot.cache.get('guilds').length || 0}`],
          [ 'Channels', Object.keys(this.bot.channelGuildMap).length ],
          [ 'Guilds', this.bot.guilds.size ],
          [ 'Users', this.bot.users.size ],
          [ '', '' ],
          [ 'OS', `${this.mutable.platform.platform} ${this.mutable.platform.release} (${this.mutable.platform.arch})` ],
          [ 'Uptime', moment.duration(this.bot.uptime).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]') ],
          [ 'OS Uptime', moment.duration(os.uptime() * 1000).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]') ],
          [ 'User-Agent', this.bot.ua ],
          [ 'Memory Usage', `${this._formatBytes(process.memoryUsage().heapUsed)} / ${this._formatBytes(os.totalmem())} (${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(2)}%)` ],
          [ 'Process Hash', process.hash ],
          [ 'Load average', os.loadavg().map(v => v.toFixed(2)).join(' / ') ]
        ]
      };
    }

    if (!args['no-bot'] && !args['raw'] && !args['r']) {
      fields.push({
        name: '❯ Bot information',
        value: [
          `${this.bot.emote('info', 'statistics', '7')} **User Agent**: ${this.bot.ua ? this.bot.ua : 'Unknown'}`,
          `${this.bot.emote('info', 'statistics', '8')} **Shards \`[Current / Total]\`**: ${msg.channel.guild.shard.id} **/** ${this.bot.shards.size}`,
          `${this.bot.emote('info', 'statistics', '9')} **Cache \`[Users / Guilds]\`**: ${this.bot.cache.get('users').length || 0} **/** ${this.bot.cache.get('guilds').length || 0}`,
          `${this.bot.emote('info', 'statistics', '10')} **Channels**: ${Object.keys(this.bot.channelGuildMap).length}`,
          `${this.bot.emote('info', 'statistics', '11')} **Guilds**: ${this.bot.guilds.size}`,
          `${this.bot.emote('info', 'statistics', '12')} **Users**: ${this.bot.users.size}`
        ].join('\n'),
        inline: this.static.inline        
      });
    }

    if (!args['no-sys'] && !args['raw'] && !args['r']) {
      fields.push({
        name: '❯ System and process information',
        value: [
          `${this.bot.emote('info', 'statistics', '1')} **Operating System**: ${this.mutable.platform.platform} ${this.mutable.platform.release} **(**${this.mutable.platform.arch}**)**`,
          `${this.bot.emote('info', 'statistics', '2')} **Process Hash**: ${process.hash}`,
          `${this.bot.emote('info', 'statistics', '3')} **Load Average**: ${os.loadavg().map(v => v.toFixed(2)).join(' **/** ')}`,
          `${this.bot.emote('info', 'statistics', '4')} **OS Uptime**: ${moment.duration(os.uptime() * 1000).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]')}`,
          `${this.bot.emote('info', 'statistics', '5')} **Uptime**: ${moment.duration(this.bot.uptime).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]')}`,
          `${this.bot.emote('info', 'statistics', '6')} **Memory**: ${this._formatBytes(process.memoryUsage().heapUsed)} **/** ${this._formatBytes(os.totalmem())} **(**${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(2)}%**)**`    
        ].join('\n'),
        inline: this.static.inline
      });
    }

    if (!args['no-deps'] && !args['raw'] && !args['r']) {
      fields.push({
        name: '❯ Runtime & Dependencies',
        value: `**Node.js**: ${process.version}\n\n${Array.list(Object.keys(this.bot.pkg.dependencies).map((v, _) => `\`${v}\``))}`,
        inline: this.static.inline
      });
    }

    if (!args['no-cpu'] && !args['raw'] && !args['r']) {
      fields.push({
      name: '❯ CPU information',
      value: `\`\`\`ini\navailable=${this.mutable.platform.cpus.length}\nendianness="${os.endianness()}"\n; List of all (available) CPU's\n${this.mutable.platform.cpus.map((v, _) => `[${_ + 1}] ${v.model}`).join('\n')}\`\`\``,
      inline: this.static.inline
    });
  }

    msg.channel.createMessage(
      fields.raw ? `\`\`\`${table(fields.content, this.static.TABLE_CONFIG)}\`\`\`` :
      {
        content: '',
        embed: {
          color: this.bot.col.info.stats,
          fields: fields,
          thumbnail: {
            url: !args['no-thumb'] ? 'attachment://thumb.png' : ''
          }
        }
      }, this.thumb && !fields.raw && !args['no-thumb'] ?
      {
        file: this.thumb,
        name: 'thumb.png'
      } : '');

    message.delete();
  }

  _formatBytes(b) {
    if(b < 1073741824) return(b / 1048576).toFixed(2) + ' MB';
    else return(b / 1073741824).toFixed(2) + ' GB';
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';

      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('info', 'statistics', '0'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};