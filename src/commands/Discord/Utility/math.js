const { DiscordCommand } = require('../../../core');

const { NodeVM }              = require('vm2');
const { eval: mEval, config } = require('mathjs');

module.exports = class Math extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'math',
      syntax     : 'math <...equation:str>',
      aliases    : [],
      argument   : [ '<...equation:str>' ],
      description: 'Evaluate an equation',

      hidden     : false,
      enabled    : true,
      cooldown   : 5000,
      category   : 'Utility',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: []
    });

    this.static = {
      regex: /eval|import|parse|simplify|derivative|createUnit/gi
    };
    
    Object.freeze(this);
    Object.freeze(this.static);
    config({ number: 'BigNumber', precision: 64 });
  }

  async execute(msg, args) {
    let mess = await msg.channel.createMessage(this._localize(msg.author.locale.util.math.busy));
    
    let sandbox = null;
    let message = null;
    let blocked = undefined;
    let equation = 0;

    try {
      equation = args[0] ? args.join(' ') : '2+2-1';
      blocked = this.static.regex.exec(equation);
      if (blocked && blocked[0] && !this.bot.op(msg.author.id)) throw this._localize(msg.author.locale.util.math.blocked, blocked[0]);

      const vm = new NodeVM({ timeout: 10000, sandbox: { mEval: mEval },  require: { external: true } });
      sandbox  = vm.run('module.exports = function(equation) { return mEval(`${equation}`) }');
      message  = this.bot.util.shorten(`${this.bot.emote('util', 'math', '1' )} ${msg.author.mention} **>** \`${this.bot.util.escapeMarkdown(equation, false, true)}\` = \`${sandbox(equation) || 0}\``, 2000);
    } catch (ex) {
      message = this.bot.util.shorten(`${this.bot.emote( 'util', 'math', '2' )} ${msg.author.mention} **>** \`${this.bot.util.escapeMarkdown(equation, false, true)}\` = \`${this.bot.util.escapeMarkdown(ex.message ? ex.message : ex, false, true)}\``, 2000);
    } finally {
      mess.edit(message);
    }
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        msg = msg.replace(/\$\[math:function]/g, extData);
      }

      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('util', 'math', '0'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};