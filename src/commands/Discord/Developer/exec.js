const { DiscordCommand } = require('../../../core');

const { execSync } = require('child_process');

module.exports = class Exec extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      // Information
      name       : 'exec',
      syntax     : 'exec <...cmd:str>',
      aliases    : [],
      argument   : [  ],
      description: 'Execute a command',
      // Checks
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
    let result  = '$';
    
    let raw     = args.join(' ').trim().endsWith('--raw') ? args.pop() : false;
    let silent  = args.join(' ').trim().endsWith('--silent') || args.join(' ').trim().endsWith('-s') ? args.pop() : false;
    let errored = false;

    if (args.length <= 0) return msg.channel.createMessage(this.localize(msg.author.locale['developer']['exec']['args']));

    const message    = await msg.channel.createMessage(this.localize(msg.author.locale['developer']['exec']['busy']));

    try { result = execSync(args.join(' '), { timeout: 100000 }); }
    catch (ex) { result = ex; errored = true; }
    finally {
      if (silent) return message.edit(this.localize(msg.author.locale['developer']['exec']['silent']));
      result = this.bot.util.escapeMarkdown(this.sanitize(String(result)));

      if (raw) return msg.channel.createMessage(`\`\`\`sh\n${result}\`\`\``);
      message.edit({
        content: '',
        embed: {
          color      : (errored ? this.bot.col['developer']['exec']['failure'] : this.bot.col['developer']['exec']['success']),
          description: this.localize(msg.author.locale['developer']['exec']['result'].join('\n'), { resultType: errored ? msg.author.locale['developer']['exec']['types'][1] : msg.author.locale['developer']['exec']['types'][0], resultMessage: this.bot.util.shorten(result, 1850) || '$' })
        }
      });
    };
  }

  sanitize(msg) {
    // Return nothing if empty
    if (!msg) return msg;
    // API tokens
    for (let _ in this.bot.conf['api']) {
      msg = msg.replace(new RegExp(this.bot.conf['api'][_], 'gi'), '<--snip-->');
    }
    // Webhook information
    for (let _ in this.bot.conf.discord.webhook) {
      msg = msg.replace(new RegExp(this.bot.conf.discord.webhook[_], 'gi'), '<--snip-->');
    }
    // Bot tokens
    return msg
      .replace(new RegExp(this.bot.token, 'gi'), '<--snip-->')
      .replace(new RegExp(this.bot.conf['discord']['token'], 'gi'), '<--snip-->');
  }

  localize(msg, extData) {
    // Empty
    if (!msg) return '';
    // extData
    if (extData && extData.resultType) {
      msg = msg.replace(/\$\[result:type]/g, extData.resultType);
    }
      if (extData && extData.resultMessage) {
      msg = msg.replace(/\$\[result:message]/g, extData.resultMessage);
    }
    // Main
    return msg
    .replace(/\$\[emoji#0]/g, this.bot.emote('developer', 'exec', '0'))
    .replace(/\$\[emoji#1]/g, this.bot.emote('developer', 'exec', '1'))
    .replace(/\$\[emoji#2]/g, this.bot.emote('developer', 'exec', '2'))
    .replace(/\$\[emoji#3]/g, this.bot.emote('developer', 'exec', '3'));
  }
};
