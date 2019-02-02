const { DiscordCommand } = require('../../../core');

const { NodeVM }              = require('vm2');
const { eval: mEval, config } = require('mathjs');

module.exports = class Math extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'math',
      syntax      : 'math <...equation:str>',
      aliases     : [],
      argument    : [ '<...equation:str>' ],
      description : 'Evaluate an equation',

      hidden      : false,
      enabled     : true,
      cooldown    : 5000,
      category    : 'Utility',
      ownerOnly   : false,
      guildOnly   : false,
      permissions : []
    });

    this.regex = /eval|import|parse|simplify|derivative|createUnit/gi;
    config({ number: 'BigNumber', precision: 64 });
  }

  async execute(msg, args) {
    let sandbox    = null;
    let message    = null;
    let blocked    = undefined;
    let origMsg    = await msg.channel.createMessage(this.localize(msg.author.locale['util']['math']['busy']));
    let equation   = 0;

    try {
      equation = (args[0] ? args.join(' ') : '2+2-1');
      blocked  = this.regex.exec(equation);
      if (blocked && blocked[0] && !this.bot.op(msg.author.id)) throw msg.author.locale['util']['math']['blocked'].replace(/\$\[math:function]/g, blocked[0]);

      const vm = new NodeVM({ timeout: 10000, sandbox: { mEval: mEval },  require: { external: true } });
      sandbox  = vm.run('module.exports = function(equation) { return mEval(`${equation}`) }');
      message  = `${this.bot.util.shorten(`${this.bot.emote('util', 'math', '1' )} ${msg.author.mention} **>** \`${this.bot.util.escapeMarkdown(equation.replace(/ /gi, ''), false, true)}\` = \`${sandbox(equation) || 0}\``, 2000)}`;
    } catch (ex) {
      message = `${this.bot.util.shorten(`${this.bot.emote( 'util', 'math', '2' )} ${msg.author.mention} **>** \`${this.bot.util.escapeMarkdown(equation.replace(/ /gi, ''), false, true)}\` = \`${this.bot.util.escapeMarkdown(ex.message ? ex.message : ex, false, true)}\``, 2000)}`;
    } finally { origMsg.edit(message); }
  }

  localize(msg) {
    if (!msg) return '';
    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('util', 'math', '0'));
  }
};