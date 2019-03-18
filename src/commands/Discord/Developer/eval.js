const { DiscordCommand } = require('../../../core');

const { inspect } = require('util');

module.exports = class Eval extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      path       : undefined,
      name       : 'eval',
      syntax     : 'eval <...code:str>',
      bearer     : 'yorushika',
      aliases    : [],
      argument   : [],
      description: 'Evaluate a snippet',

      hidden     : false,
      enabled    : true,
      cooldown   : 0,
      category   : 'Developer',
      ownerOnly  : true,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  async execute(msg, args, user, guild) {
    let result = '{}';
    let errored = false;
    
    const raw = args.join(' ').trim().endsWith('--raw') ? args.pop() : false;
    const silent  = args.join(' ').trim().endsWith('--silent') || args.join(' ').trim().endsWith('-s') ? args.pop() : false;
    const asynchr = args.join(' ').trim().includes('return') || args.join(' ').trim().includes('await');

    if (args.length <= 0) return msg.channel.createMessage(this._localize(msg.author.locale.developer.eval.args));

    const message = await msg.channel.createMessage(this._localize(msg.author.locale.developer.eval.busy));

    try {
      result = asynchr ? eval(`(async() => {${args.join(' ')}})();`) : eval(args.join(' '));
    } catch (ex) {
      result = ex;
      errored = true;
    } finally {
      if (silent) return message.edit(this._localize(msg.author.locale.developer.eval.silent));
      result = this.bot.util.escapeMarkdown(this._sanitize(String(result)), true);
      
      if (raw) return msg.channel.createMessage(`\`\`\`js\n${result}\`\`\``);
      message.edit({
        content: '',
        embed: {
          color: errored ? this.bot.col.developer.eval.failure : this.bot.col.developer.eval.success,
          description: this._localize(msg.author.locale.developer.eval.result.join('\n'), { resultType: errored ? msg.author.locale.developer.eval.types[1] : msg.author.locale.developer.eval.types[0], resultMessage: this.bot.util.shorten(result, 1850) || '{}' })
        }
      });
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

  _localize(msg, extData = {}) {
    try {
      if (!msg) return 'INVALID_STRING';

      if (extData) {
        if (extData.resultType) {
          msg = msg.replace(/\$\[result:type]/g, extData.resultType);
        }
        if (extData.resultMessage) {
          msg = msg.replace(/\$\[result:message]/g, extData.resultMessage);
        }
      }

      return msg
        .replace(/\$\[emoji#0]/g, this.bot.emote('developer', 'eval', '0'))
        .replace(/\$\[emoji#1]/g, this.bot.emote('developer', 'eval', '1'))
        .replace(/\$\[emoji#2]/g, this.bot.emote('developer', 'eval', '2'))
        .replace(/\$\[emoji#3]/g, this.bot.emote('developer', 'eval', '3'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};