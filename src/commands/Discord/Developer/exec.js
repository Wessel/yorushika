const { DiscordCommand } = require('../../../core');

const { execSync } = require('child_process');

module.exports = class Exec extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'exec',
      syntax     : 'exec <...cmd:str>',
      aliases    : [],
      argument   : [ '<...cmd:str>' ],
      description: 'Execute a command',
      hidden     : false,
      enabled    : true,
      cooldown   : 0,
      category   : 'Developer',
      ownerOnly  : true,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  async execute(msg, args) {
    let result  = '$';
    
    const raw = args.join(' ').trim().endsWith('--raw') ? args.pop() : false;
    const silent = args.join(' ').trim().endsWith('--silent') || args.join(' ').trim().endsWith('-s') ? args.pop() : false;
    const errored = false;

    if (args.length <= 0) return msg.channel.createMessage(this._localize(msg.author.locale.developer.exec.args));

    const message = await msg.channel.createMessage(this._localize(msg.author.locale.developer.exec.busy));

    try {
      result = execSync(args.join(' '), { timeout: 100000 });
    } catch (ex) {
      result = ex;
      errored = true;
    } finally {
      if (silent) return message.edit(this._localize(msg.author.locale.developer.exec.silent));
      result = this.bot.util.escapeMarkdown(this.bot.util.shorten(this._sanitize(String(result)), 1850), true);

      if (raw) {
        message.edit(`\`\`\`sh\n${result}\`\`\``);
      } else {
        message.edit({
          content: '',
          embed: {
            color: errored ? this.bot.col.developer.exec.failure : this.bot.col.developer.exec.success,
            description: this._localize(msg.author.locale.developer.exec.result.join('\n'), { resultType: errored ? msg.author.locale.developer.exec.types[1] : msg.author.locale.developer.exec.types[0], resultMessage: result || '$' })
          }
        });
      }
    };
  }

  _sanitize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';

      for (let _ in this.bot.conf.api) {
        msg = msg.replace(new RegExp(this.bot.conf.api[_], 'gi'), '<--snip-->');
      }

      for (let _ in this.bot.conf.discord.webhook) {
        msg = msg.replace(new RegExp(this.bot.conf.discord.webhook[_], 'gi'), '<--snip-->');
      }

      return msg
        .replace(new RegExp(this.bot.token, 'gi'), '<--snip-->')
        .replace(new RegExp(this.bot.conf['discord']['token'], 'gi'), '<--snip-->');
    } catch (ex) {
      return `SANITIZE_ERROR:${ex.code}`;
    }
  }

  _localize(msg, extData) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        if (extData.resultType) {
          msg = msg.replace(/\$\[result:type]/g, extData.resultType);
        }
        if (extData.resultMessage) {
          msg = msg.replace(/\$\[result:message]/g, extData.resultMessage);          
        }
      }

      return msg
        .replace(/\$\[emoji#0]/g, this.bot.emote('developer', 'exec', '0'))
        .replace(/\$\[emoji#1]/g, this.bot.emote('developer', 'exec', '1'))
        .replace(/\$\[emoji#2]/g, this.bot.emote('developer', 'exec', '2'))
        .replace(/\$\[emoji#3]/g, this.bot.emote('developer', 'exec', '3'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};