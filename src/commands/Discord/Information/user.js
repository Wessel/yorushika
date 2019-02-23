const { DiscordCommand } = require('../../../core');

const moment = require('moment'); require('../../../util/moment/diff.js');

module.exports = class User extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'user',
      syntax     : 'user <...user:string>',
      aliases    : [ '<...user:string>' ],
      argument   : [],
      description: 'Get a user\'s information',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      status: {
        '_unknown': `${this.bot.emote('info', 'user', '6')}Unknown`,
        'online'  : `${this.bot.emote('info', 'user', '7')}online`,
        'idle'    : `${this.bot.emote('info', 'user', '8')}away`,
        'dnd'     : `${this.bot.emote('info', 'user', '9')}do not disturb`,
        'offline' : `${this.bot.emote('info', 'user', '10')}offline`
      }
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
    const $ = this.bot.REST.getUser(args.length >= 1 ? args.join(' ') : msg.author.id);
    if (!$) {
      return msg.channel.createMessage(this._localize(msg.author.locale.info.user.invalid));
    }    
    
    const m = msg.channel.guild && msg.channel.guild.members.get($.id) ? msg.channel.guild.members.get($.id) : undefined;
    
    const structure = {
      embed: {
        color: this.bot.col.info.user,
        thumbnail: {
          url: $.avatar ? $.avatarURL : $.defaultAvatarURL
        },
        fields: [
          {
            name: msg.author.locale.info.user.fields.self.name,
            value: this._localize(msg.author.locale.info.user.fields.self.value.join('\n'), { user: $, member: m }),
            inline: true
          }
        ]
      }
    };

    if (m) {
      structure.embed.fields.push({
        name: msg.author.locale.info.user.fields.member.name,
        value: this._localize(msg.author.locale.info.user.fields.member.value.join('\n'), { user: $, member: m, guildId: msg.channel.guild.id }),
        inline: true
      });
    }

    const mutual = this.bot.guilds.filter((v) => v.members.has($.id)).map((v) => v.name);
    structure.embed.fields.push({
      name: msg.author.locale.info.user.fields.mutual,
      value: mutual.length >= 1 ? this._limit(mutual, 25).join(' **/** ') : 'none'
    });

    msg.channel.createMessage(structure);
  }

  _limit(array, max) {
    if (array.length <= max) {
      return array;
    } else {
      const length = array.length - max;
      array.splice(max, array.length - max);
      array.push(`And ${length} more...`);
      
      return array;
    }
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      if (extData) {
        if (extData.user) {
          const { user } = extData;
          user.c = moment.preciseDiff(new Date(), new Date(user.createdAt), true);
          user.cs = [
            user.c.years >= 1 ? `${user.c.years} years` : undefined,
            user.c.months >= 1 ? `${user.c.months} months` : undefined,
            user.c.days >= 1 ? `${user.c.days} days` : undefined,
            user.c.days <= 0 && user.c.months <= 0 && user.c.years <= 0 ? 'Less than a day' : undefined
          ].join(' ');
        
        msg = msg
        .replace(/\$\[user:id]/g , user.id)
        .replace(/\$\[user:tag]/g , `${user.username}#${user.discriminator}`)
        .replace(/\$\[user:created@exact]/g, moment(user.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
        .replace(/\$\[user:created@precise]/g, user.cs)
        .replace(/\$\[user:status@full]/g, extData.member && this.static.status[extData.member.status] ? this.static.status[extData.member.status] : this.static.status['_unknown']);
      }

        if (extData.member) {
          const { member } = extData;
          member.c  = moment.preciseDiff(new Date(), new Date(member.joinedAt), true);
          member.cs = [
            member.c.years >= 1 ? `${member.c.years} years` : undefined,
            member.c.months >= 1 ? `${member.c.months} months` : undefined,
            member.c.days >= 1 ? `${member.c.days} days` : undefined,
            member.c.days <= 0 && member.c.months <= 0 && member.c.years <= 0 ? 'Less than a day' : undefined
          ].join(' ');
          
          msg = msg
            .replace(/\$\[member:nickname]/g, member && member.nick ? this.bot.util.escapeMarkdown(member.nick) : '*No nickname set*')
            .replace(/\$\[member:roles]/g, member.roles.length >= 1 ? this._limit(member.roles.map((v) => `<@&${v}>`), 25).join(' **/** ') : 'none')
            .replace(/\$\[member:created@exact]/g, moment(member.joinedAt).format('YYYY[/]MM[/]DD HH[:]mm'))
            .replace(/\$\[member:created@precise]/g, member.cs);
        }
      }
    
      return msg
        .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'user', '0'))
        .replace(/\$\[emoji#1]/g, this.bot.emote('info', 'user', '1'))
        .replace(/\$\[emoji#2]/g, this.bot.emote('info', 'user', '2'))
        .replace(/\$\[emoji#3]/g, this.bot.emote('info', 'user', '3'))
        .replace(/\$\[emoji#4]/g, this.bot.emote('info', 'user', '4'))
        .replace(/\$\[emoji#5]/g, this.bot.emote('info', 'user', '5'))
        .replace(/\$\[emoji#11]/g, this.bot.emote('info', 'user', '11'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex}`;
    }
  }
};