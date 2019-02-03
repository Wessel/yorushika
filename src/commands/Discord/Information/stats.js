const { DiscordCommand } = require('../../../core');

const os               = require('os');
const larg             = require('larg');
const moment           = require('moment'); require('../../../util/moment/format');
const { readFileSync } = require('fs');

module.exports = class Stats extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'stats',
      syntax     : 'stats [--{no-deps|no-bot|no-sys|no-cpu|no-thumb}]',
      aliases    : [ 'statistics' ],
      argument   : [ '[--{no-deps|no-bot|no-sys|no-cpu|no-thumb}]' ],
      description: 'Some small statistics',

      hidden     : false,
      enabled    : true,
      cooldown   : 10000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    try { this.thumb = readFileSync('./assets/img/thumb/stats.png'); }
    catch(ex) { this.thumb = undefined; }
  }

  async execute( msg, args ) {
          args    = larg(args);
    const message = await msg.channel.createMessage(this.localize(msg.author.locale['info']['stats']['fetching']));
    
    const cpus   = os.cpus();
    let platform = {
      'arch'    : os.arch() ? os.arch() : '??x',
      'release' : os.release() ? os.release() : '?.?.?',
      'platform': os.platform()
    };

    switch (platform.platform) {
      case 'aix'    : platform.platform = 'Linux'; break;
      case 'sunos'  : platform.platform = 'Linux'; break;
      case 'win32'  : platform.platform = 'Windows'; break;
      case 'linux'  : platform.platform = 'Linux'; break;
      case 'darwin' : platform.platform = 'Macintosh'; break;
      case 'freebsd': platform.platform = 'Linux'; break;
      case 'openbsd': platform.platform = 'Linux'; break;
      case 'android': platform.platform = 'Android'; break;
      default       : platform.platform = 'Unknown';
    }

    const fields = [];

    if (!args['no-bot']) {
      fields.push({
        name  : '❯ Bot information',
        value :
        [
          `${this.bot.emote('info', 'statistics', '7')} **User Agent**: ${this.bot.ua ? this.bot.ua : 'Unknown'}`,
          `${this.bot.emote('info', 'statistics', '8')} **Shards \`[Current / Total]\`**: ${msg.channel.guild.shard.id} **/** ${this.bot.shards.size}`,
          `${this.bot.emote('info', 'statistics', '9')} **Cache \`[Users / Guilds]\`**: ${this.bot.cache.get('users').length || 0} **/** ${this.bot.cache.get('guilds').length || 0}`,
          `${this.bot.emote('info', 'statistics', '10')} **Channels**: ${Object.keys(this.bot.channelGuildMap).length}`,
          `${this.bot.emote('info', 'statistics', '11')} **Guilds**: ${this.bot.guilds.size}`,
          `${this.bot.emote('info', 'statistics', '12')} **Users**: ${this.bot.users.size}`
        ].join('\n'),
        inline: true        
      });
    }
    if (!args['no-sys']) {
      fields.push({
        name  : '❯ System and process information',
        value :
        [
          `${this.bot.emote('info', 'statistics', '1')} **Operating System**: ${platform.platform} ${platform.release} **(**${platform.arch}**)**`,
          `${this.bot.emote('info', 'statistics', '2')} **Process Hash**: ${process.hash}`,
          `${this.bot.emote('info', 'statistics', '3')} **Load Average**: ${os.loadavg().join(' **/** ')}`,
          `${this.bot.emote('info', 'statistics', '4')} **OS Uptime**: ${moment.duration(os.uptime() * 1000).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]')}`,
          `${this.bot.emote('info', 'statistics', '5')} **Uptime**: ${moment.duration(this.bot.uptime).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]')}`,
          `${this.bot.emote('info', 'statistics', '6')} **Memory**: ${this.formatBytes(process.memoryUsage().heapUsed)} **/** ${this.formatBytes(os.totalmem())} **(**${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(2)}%**)**`    
        ].join('\n'),
        inline: true
      });
    }
    if (!args['no-deps']) {
      fields.push({
        name  : '❯ Runtime & Dependencies',
        value : `**Node.js**: ${process.version}\n\n${Array.list(Object.keys(this.bot.pkg.dependencies).map((v, _) => `\`${v}\``))}`,
        inline: true
      });
    }
    if (!args['no-cpu']) {
      fields.push({
      name  : '❯ CPU information',
      value : `\`\`\`ini\navailable=${cpus.length}\nendianness="${os.endianness()}"\n; List of all (available) CPU's\n${cpus.map((v, _) => `[${_ + 1}] ${v.model}`).join('\n')}\`\`\``,
      inline: true
    });
  }


    msg.channel.createMessage({
      content: '',
      embed: {
        color    : this.bot.col['info']['stats'],
        fields   : fields,
        thumbnail: { url: !args['no-thumb'] ? 'attachment://thumb.png' : '' }
      }
    },
    this.thumb && !args['no-thumb'] ? { file: this.thumb, name: 'thumb.png' } : '');
    message.delete();
  }

  formatBytes(b) {
    if(b < 1073741824) return(b / 1048576).toFixed(2) + ' MB';
    else return(b / 1073741824).toFixed(2) + ' GB';
  }

  localize(msg) {
    if (!msg) return '';
    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('info', 'statistics', '0'));
  }
};