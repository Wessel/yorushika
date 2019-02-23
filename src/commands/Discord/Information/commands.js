const { DiscordCommand } = require('../../../core');

const moment           = require('moment'); require('../../../util/moment/format');
const { readFileSync } = require('fs');

module.exports = class Commands extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'commands',
      syntax     : 'commands [command:str]',
      aliases    : [ 'command', 'cmds', 'cmd', 'help' ],
      argument   : [ '[command:str]' ],
      description: 'Lists all commands',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      inline: true
    };

    try {
      this.static.thumb = readFileSync('./assets/img/thumb/commands.png');
    } catch (ex) {
      this.static.thumb = undefined;
    }

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
    let cmd = this.bot.cmds.filter((v) => v.extData.name.toLowerCase() === args.join(' ').toLowerCase() || v.extData.aliases.includes(args.join(' ').toLowerCase()));
    
    if (cmd.length >= 1) {
      cmd = cmd[0].extData;

      msg.channel.createMessage({
        embed: {
          color: this.bot.col.info.commands.single,
          description: this._localize(msg.author.locale.info.commands.single.join('\n'), { msg: msg, cmd: cmd })
        }
      });
    } else {
      msg.channel.createMessage({
        embed: {
          color: this.bot.col.info.commands.multi,
          thumbnail: {
            url: 'attachment://thumb.png'
          },
          description: this._localize(msg.author.locale.info.commands.multi.join('\n'), { msg: msg }),
          fields: [
            this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'core' && !v.extData.hidden).length >= 1 ? {
              name: msg.author.locale.info.commands.fields[0],
              value: this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'core' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: this.static.inline
            } : undefined,
            this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'information' && !v.extData.hidden).length >= 1 ? {
              name: msg.author.locale.info.commands.fields[1],
              value: this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'information' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: this.static.inline
            } : undefined,
            this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'image' && !v.extData.hidden).length >= 1 ? {
              name: msg.author.locale.info.commands.fields[2],
              value: this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'image' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: this.static.inline
            } : undefined,
            this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'utility' && !v.extData.hidden).length >= 1 ? {
              name: msg.author.locale.info.commands.fields[3],
              value: this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'utility' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: this.static.inline
            } : undefined,
            this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'developer' && !v.extData.hidden).length >= 1 ? {
              name: msg.author.locale.info.commands.fields[4],
              value: this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'developer' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: this.static.inline
            } : undefined,
            this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'tags' && !v.extData.hidden).length >= 1 ? {
              name: msg.author.locale.info.commands.fields[5],
              value: this.bot.cmds.filter((v) => v.extData.category.toLowerCase() === 'tags' && !v.extData.hidden).map((v) => `**•** [\`${msg.prefix}${v.extData.name}\`](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}) ${v.extData.description ? `**-** ${v.extData.description}` : ''}`).join('\n'),
              inline: this.static.inline
            } : undefined
          ]
        }
      }, this.static.thumb ?
      {
        file: this.static.thumb,
        name: 'thumb.png'
      } : undefined);        
    }
  }

  localize(msg, extData) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      if (extData) {
        if (extData.msg) {
          msg = msg
            .replace(/\$\[guild:name]/g, extData.msg.channel.guild.name)
            .replace(/\$\[bot:invite]/g, this.bot.gatherInvite(8))
            .replace(/\$\[guild:prefix]/g, extData.msg.prefix);
        }
        if (extData.cmd) {
          msg = msg
            .replace(/\$\[command:name]/g, extData.cmd.name)
            .replace(/\$\[command:syntax]/g, `${extData.msg.prefix}${extData.cmd.syntax}`)
            .replace(/\$\[command:aliases]/g, extData.cmd.aliases.map((v) => `\`${v}\``).join(', ') || '`n/a`')
            .replace(/\$\[command:arguments]/g, extData.cmd.argument.map((v) => `\`${v}\``).join(', ') || '`n/a`')
            .replace(/\$\[command:cooldown#formatted]/g, moment.duration(extData.cmd.cooldown ? extData.cmd.cooldown : 0).format('YYYY[y] MM[M] DD[d] HH[h] mm[m] ss[s]'));    
        }
      }
      
      return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'commands', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('info', 'commands', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('info', 'commands', '2'))
      .replace(/\$\[emoji#3]/g, this.bot.emote('info', 'commands', '3'))
      .replace(/\$\[emoji#4]/g, this.bot.emote('info', 'commands', '4'))
      .replace(/\$\[emoji#5]/g, this.bot.emote('info', 'commands', '5'))
      .replace(/\$\[emoji#6]/g, this.bot.emote('info', 'commands', '6'))
      .replace(/\$\[emoji#7]/g, this.bot.emote('info', 'commands', '7'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};