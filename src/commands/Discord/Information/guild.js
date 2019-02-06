const { DiscordCommand } = require('../../../core');

const moment = require('moment'); require('../../../util/moment/diff.js');

module.exports = class Guild extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'guild',
      syntax      : 'guild <...guild:string>',
      aliases     : [ '<...guild:string>' ],
      argument    : [],
      description : 'Get a guild\'s information',

      hidden      : false,
      enabled     : true,
      cooldown    : 1000,
      category    : 'Information',
      ownerOnly   : false,
      guildOnly   : false,
      permissions : [ 'embedLinks' ]
    });

    this.verifications = { '0': 'none', '1': 'low', '2': 'medium', '3': '(╯°□°）╯︵ ┻━┻', '4': '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻' };
    this.explicits     = { '0': 'off', '1': 'everyone without roles', '2': 'everyone' };
    this.flags         = { 'eu-central': '🇪🇺', 'london': '🇬🇧', 'amsterdam': '🇳🇱', 'japan': '🇯🇵',
                           'brazil': '🇧🇷', 'us-west': '🇺🇸', 'hongkong': '🇭🇰', 'sydney': '🇦🇺',
                           'singapore': '🇸🇬', 'us-central': '🇺🇸', 'eu-west': '🇪🇺', 'us-south': '🇺🇸',
                           'us-east': '🇺🇸', 'frankfurt': '🇩🇪', 'russia': '🇷🇺' };
  }

  async execute(msg, args) {
    const g = this.bot.REST.getGuild((args.length >= 1 ? args.join(' ') : msg.channel.guild.id));
    
    if (!g) return msg.channel.createMessage(this.localize(msg.author.locale['info']['guild']['invalid']));    
    msg.channel.createMessage({
      embed: {
        color    : this.bot.col['info']['guild'],
        thumbnail: { url: g.iconURL },
        fields   : [
          {
            name: msg.author.locale['info']['guild']['fields']['guild']['name'],
            value: this.localize(msg.author.locale['info']['guild']['fields']['guild']['value'].join('\n'), { guild: g }),
            inline: true
          },
          {
            name: msg.author.locale['info']['guild']['fields']['owner']['name'],
            value: this.localize(msg.author.locale['info']['guild']['fields']['owner']['value'].join('\n'), { guild: g }),
            inline: true
          },
          {
            name: msg.author.locale['info']['guild']['fields']['members']['name'],
            value: this.localize(msg.author.locale['info']['guild']['fields']['members']['value'].join('\n'), { guild: g }),
            inline: true
          }
        ]
      }
    });
  }

  localize(msg, extData) {
    if (!msg) return '';

    if (extData && extData.guild) {
      const o    = this.bot.users.get(extData.guild.ownerID);
            o.c  = moment.preciseDiff(new Date(), new Date(o.createdAt), true);
            o.cs = [
              o.c.years >= 1  ?  `${o.c.years} years`  : undefined,
              o.c.months >= 1 ? `${o.c.months} months` : undefined,
              o.c.days >= 1   ? `${o.c.days} days`     : undefined
            ].join(' ');

      extData.guild.c  = moment.preciseDiff(new Date(), new Date(extData.guild.createdAt), true);
      extData.guild.cs = [
        extData.guild.c.years >= 1  ?  `${extData.guild.c.years} years`  : undefined,
        extData.guild.c.months >= 1 ? `${extData.guild.c.months} months` : undefined,
        extData.guild.c.days >= 1   ? `${extData.guild.c.days} days`     : undefined
      ].join(' ');

      msg = msg
        .replace(/\$\[guild:id]/g, extData.guild.id)
        .replace(/\$\[guild:name]/g, extData.guild.name)
        .replace(/\$\[guild:region]/g, `${this.flags[extData.guild.region] ? this.flags[extData.guild.region] : this.bot.emote('info', 'guild', '2')} ${extData.guild.region}`)
        .replace(/\$\[guild:explicity]/g, this.explicits[extData.guild.explicitContentFilter])
        .replace(/\$\[guild:verification]/g, this.verifications[extData.guild.verificationLevel])
        .replace(/\$\[guild:fullChannels]/g , `${extData.guild.channels.filter((v) => v.type === 0).length} / ${extData.guild.channels.filter((v) => v.type === 2).length}`)
        .replace(/\$\[guild:users#bot]/g, extData.guild.members.filter((v) => v.bot).length)
        .replace(/\$\[guild:users#dnd]/g, extData.guild.members.filter((v) => v.status === 'dnd').length)
        .replace(/\$\[guild:users#idle]/g, extData.guild.members.filter((v) => v.status === 'idle').length)
        .replace(/\$\[guild:users#total]/g, extData.guild.members.filter((v) => !v.bot).length)
        .replace(/\$\[guild:users#online]/g, extData.guild.members.filter((v) => v.status === 'online').length)
        .replace(/\$\[guild:users#offline]/g, extData.guild.members.filter((v) => v.status === 'offline').length)
        .replace(/\$\[guild:created@precise]/g, extData.guild.cs)
        .replace(/\$\[guild:created@exact]/g, moment(extData.guild.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
        .replace(/\$\[guild:owner#id]/g , o.id)
        .replace(/\$\[guild:owner#tag]/g , `${o.username}#${o.discriminator}`)
        .replace(/\$\[guild:owner#created@precise]/g, o.cs)
        .replace(/\$\[guild:owner#created@exact]/g, moment(o.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
        .replace(/\$\[guild:owner#avatar]/g, o.avatar ? o.avatarURL : o.defaultAvatarURL);
    }

    return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'guild', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('info', 'guild', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('info', 'guild', '2'))
      .replace(/\$\[emoji#3]/g, this.bot.emote('info', 'guild', '3'))
      .replace(/\$\[emoji#4]/g, this.bot.emote('info', 'guild', '4'))
      .replace(/\$\[emoji#5]/g, this.bot.emote('info', 'guild', '5'))
      .replace(/\$\[emoji#6]/g, this.bot.emote('info', 'guild', '6'))
      .replace(/\$\[emoji#7]/g, this.bot.emote('info', 'guild', '7'))
      .replace(/\$\[emoji#8]/g, this.bot.emote('info', 'guild', '8'))
      .replace(/\$\[emoji#9]/g, this.bot.emote('info', 'guild', '9'))
      .replace(/\$\[emoji#10]/g, this.bot.emote('info', 'guild', '10'))
      .replace(/\$\[emoji#11]/g, this.bot.emote('info', 'guild', '11'))
      .replace(/\$\[emoji#12]/g, this.bot.emote('info', 'guild', '12'))
      .replace(/\$\[emoji#13]/g, this.bot.emote('info', 'guild', '13'))
      .replace(/\$\[emoji#14]/g, this.bot.emote('info', 'guild', '14'))
      .replace(/\$\[emoji#15]/g, this.bot.emote('info', 'guild', '15'));
  }
};