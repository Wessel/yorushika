const { DiscordCommand } = require('../../../core');

const moment = require('moment'); require('../../../util/moment/diff.js');

module.exports = class Guild extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'guild',
      syntax     : 'guild <...guild:str>',
      aliases    : [ '<...guild:str>' ],
      argument   : [],
      description: 'Get a guild\'s information',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      inline: true,

      flags: {
        'japan': '🇯🇵',
        'russia': '🇷🇺',
        'brazil': '🇧🇷',
        'london': '🇬🇧',
        'sydney': '🇦🇺',
        'eu-west': '🇪🇺',
        'us-west': '🇺🇸',
        'us-east': '🇺🇸',
        'us-south': '🇺🇸',
        'hongkong': '🇭🇰',
        'amsterdam': '🇳🇱',
        'singapore': '🇸🇬',
        'frankfurt': '🇩🇪',
        'us-central': '🇺🇸',
        'eu-central': '🇪🇺'
      },
      explicits: {
        '0': 'off',
        '1': 'everyone without roles',
        '2': 'everyone'
      },
      verifications: {
        '0': 'none',
        '1': 'low',
        '2': 'medium',
        '3': '(╯°□°）╯︵ ┻━┻',
        '4': '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
      }
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
    const $ = this.bot.REST.getGuild(args.length >= 1 ? args.join(' ') : msg.channel.guild.id);
    if (!$) {
      return msg.channel.createMessage(this._localize(msg.author.locale.info.guild.invalid));
    }

    msg.channel.createMessage({
      embed: {
        color: this.bot.col.info.guild,
        thumbnail: {
          url: $.iconURL
        },
        fields: [
          {
            name: msg.author.locale.info.guild.fields.guild.name,
            value: this._localize(msg.author.locale.info.guild.fields.guild.value.join('\n'), $),
            inline: this.static.inline
          },
          {
            name: msg.author.locale.info.guild.fields.owner.name,
            value: this._localize(msg.author.locale.info.guild.fields.owner.value.join('\n'), $),
            inline: this.static.inline
          },
          {
            name: msg.author.locale.info.guild.fields.members.name,
            value: this._localize(msg.author.locale.info.guild.fields.members.value.join('\n'), $),
            inline: this.static.inline
          }
        ]
      }
    });
  }

  _localize(msg, extData) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      if (extData) {
        const owner = this.bot.users.get(extData.ownerID);
        owner.c  = moment.preciseDiff(new Date(), new Date(owner.createdAt), true);
        owner.cs = [
          owner.c.years >= 1 ?  `${owner.c.years} years` : undefined,
          owner.c.months >= 1 ? `${owner.c.months} months` : undefined,
          owner.c.days >= 1 ? `${owner.c.days} days` : undefined,
          owner.days <= 0 && owner.months <= 0 && owner.years <= 0 ? 'Less than a day' : undefined              
        ].join(' ');

        extData.c  = moment.preciseDiff(new Date(), new Date(extData.createdAt), true);
        extData.cs = [
          extData.c.years >= 1 ?  `${extData.c.years} years` : undefined,
          extData.c.months >= 1 ? `${extData.c.months} months` : undefined,
          extData.c.days >= 1 ? `${extData.c.days} days` : undefined,
          extData.days <= 0 && extData.months <= 0 && extData.years <= 0 ? 'Less than a day' : undefined
        ].join(' ');
      
        msg = msg
          .replace(/\$\[guild:id]/g, extData.id)
          .replace(/\$\[guild:name]/g, extData.name)
          .replace(/\$\[guild:region]/g, `${this.static.flags[extData.region] ? this.static.flags[extData.region] : this.bot.emote('info', 'guild', '2')} ${extData.region}`)
          .replace(/\$\[guild:explicity]/g, this.static.explicits[extData.explicitContentFilter])
          .replace(/\$\[guild:verification]/g, this.static.verifications[extData.verificationLevel])
          .replace(/\$\[guild:fullChannels]/g , `${extData.channels.filter((v) => v.type === 0).length} / ${extData.channels.filter((v) => v.type === 2).length}`)
          .replace(/\$\[guild:users#bot]/g, extData.members.filter((v) => v.bot).length)
          .replace(/\$\[guild:users#dnd]/g, extData.members.filter((v) => v.status === 'dnd').length)
          .replace(/\$\[guild:users#idle]/g, extData.members.filter((v) => v.status === 'idle').length)
          .replace(/\$\[guild:users#total]/g, extData.members.filter((v) => !v.bot).length)
          .replace(/\$\[guild:users#online]/g, extData.members.filter((v) => v.status === 'online').length)
          .replace(/\$\[guild:users#offline]/g, extData.members.filter((v) => v.status === 'offline').length)
          .replace(/\$\[guild:created@precise]/g, extData.cs)
          .replace(/\$\[guild:created@exact]/g, moment(extData.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
          .replace(/\$\[guild:owner#id]/g , owner.id)
          .replace(/\$\[guild:owner#tag]/g , `${owner.username}#${owner.discriminator}`)
          .replace(/\$\[guild:owner#created@precise]/g, owner.cs)
          .replace(/\$\[guild:owner#created@exact]/g, moment(owner.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
          .replace(/\$\[guild:owner#avatar]/g, owner.avatar ? owner.avatarURL : owner.defaultAvatarURL);
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
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};