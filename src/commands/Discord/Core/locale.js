const { DiscordCommand } = require('../../../core');

module.exports = class Locale extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'locale',
      syntax      : 'locale <locale:code> <-u|-g>',
      aliases     : [],
      argument    : [ '<locale:code>', '-<u|g>' ],
      description : 'Change your locale',

      hidden      : false,
      enabled     : true,
      cooldown    : 10000,
      category    : 'Core',
      ownerOnly   : false,
      guildOnly   : false,
      permissions : [ 'embedLinks' ]
    });
  }

  async execute(msg, args, user, guild) {
    if (!user || user === null) user = await this.bot.m.connection.collection('dUsers').findOne({ userId: msg.author.id });
    if (!guild || guild === null) guild = await this.bot.m.connection.collection('dGuilds').findOne({ guildId: msg.channel.guild.id });

    if (args.join(' ').includes('-u') || args.join(' ').includes('--user')) {
      for (let _ = 0; _ < args.length; _++) {
        if (!this.bot.locales.has(args[_])) args.splice(_, -1);
      };

      if (!this.bot.locales.has(args[0])) {
        return msg.channel.createMessage(this.localize(msg.author.locale['core']['locale']['invalid']));
      }
      if (user.locale === args[0]) {
        return msg.channel.createMessage(this.localize(msg.author.locale['core']['locale']['dupe'], { uLocale: user.locale || 'en_us' }));
      }

      this.bot.cache.get('users').some((v, _) => { if (v['userId'] === msg.author.id) v.locale = args[0]; });      
      this.bot.m.connection.collection('dUsers').findOneAndUpdate({ 'userId': msg.author.id }, { $set: { locale: args[0] } }, (err) => {
        if (err) throw err;
      });

      msg.channel.createMessage(this.localize(this.bot.locales.get(args[0])['core']['locale']['changed'], { uLocale: args[0] }));
    } else if (args.join(' ').includes('-g') || args.join(' ').includes('--guild')) {
      for (let i = 0; i < args.length; i++) !this.bot.locales.has(args[i]) ? args.splice(i, 1) : undefined;
      
      if (!msg.channel.permissionsOf(msg.author.id).has('manageGuild')) return msg.channel.createMessage(this.localize(msg.author.locale['core']['locale']['gperms']));
      if (!this.bot.locales.has(args[0])) return msg.channel.createMessage(this.localize(msg.author.locale['core']['locale']['invalid']));
      if (guild.locale === args[0]) return msg.channel.createMessage(this.localize(msg.author.locale['core']['locale']['gdupe'], { gLocale: guild.locale }));
      
      this.bot.cache.get('guilds').some((v, _) => { if (v['guildId'] === msg.channel.guild.id) this.bot.cache.get('guilds').splice(_, 1); });
      this.bot.m.connection.collection('dGuilds').findOneAndUpdate({ 'guildId': msg.channel.guild.id }, { $set: { locale: args[0] } }, (err, d) => { if (err) throw err; });
      msg.channel.createMessage(this.localize(msg.author.locale['core']['locale']['gchanged'], { gLocale: args[0] }));
    } else {
      return msg.channel.createMessage({
        embed: {
          color      : this.bot.col['core']['locale'],
          description: this.localize(msg.author.locale['core']['locale']['list'].join('\n'), { uLocale: user.locale || 'en_us', gLocale: guild.locale || 'en_us' })
        }
      });
    }
  }

  localize(msg, extData) {
    if (!msg) return '';

    if (extData && extData.uLocale) msg = msg.replace(/\$\[uLocale:code]/g, extData.uLocale);
    if (extData && extData.gLocale) msg = msg.replace(/\$\[gLocale:code]/g, extData.gLocale);

    return msg
    .replace(/\$\[emoji#0]/g, this.bot.emote('core', 'locale', '0'))
    .replace(/\$\[emoji#1]/g, this.bot.emote('core', 'locale', '1'))
    .replace(/\$\[emoji#2]/g, this.bot.emote('core', 'locale', '2'))
    .replace(/\$\[emoji#3]/g, this.bot.emote('core', 'locale', '3'))
    .replace(/\$\[emoji#4]/g, this.bot.emote('core', 'locale', '4'))
    .replace(/\$\[emoji#5]/g, this.bot.emote('core', 'locale', '5'))
    .replace(/\$\[emoji#6]/g, this.bot.emote('core', 'locale', '6'))
    .replace(/\$\[emoji#7]/g, this.bot.emote('core', 'locale', '7'))
    .replace(/\$\[emoji#8]/g, this.bot.emote('core', 'locale', '8'))
    .replace(/\$\[locale:changeCmd]/g, this.extData.syntax)
    .replace(/\$\[locale:map]/g, this.bot.localeMap.join('\n'));
  }
};