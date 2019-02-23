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

  _localize(msg, extData) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      if (extData) {
        if (extData.user) {
          const u = extData.user;
          u.c = moment.preciseDiff(new Date(), new Date(u.createdAt), true);
          u.cs = [
            u.c.years >= 1 ? `${u.c.years} years` : undefined,
            u.c.months >= 1 ? `${u.c.months} months` : undefined,
            u.c.days >= 1 ? `${u.c.days} days` : undefined,
            u.c.days <= 0 && u.c.months <= 0 && u.c.years <= 0 ? 'Less than a day' : undefined
          ].join(' ');
        
        msg = msg
        .replace(/\$\[user:id]/g , u.id)
        .replace(/\$\[user:tag]/g , `${u.username}#${u.discriminator}`)
        .replace(/\$\[user:created@exact]/g, moment(u.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
        .replace(/\$\[user:created@precise]/g, u.cs)
        .replace(/\$\[user:status@full]/g, extData.member && this.static.status[extData.member.status] ? this.static.status[extData.member.status] : this.static.status['_unknown']);
      }

        if (extData.member) {
          const m = extData.member;
          m.c  = moment.preciseDiff(new Date(), new Date(m.joinedAt), true);
          m.cs = [
            m.c.years >= 1 ? `${m.c.years} years` : undefined,
            m.c.months >= 1 ? `${m.c.months} months` : undefined,
            m.c.days >= 1 ? `${m.c.days} days` : undefined,
            m.c.days <= 0 && m.c.months <= 0 && m.c.years <= 0 ? 'Less than a day' : undefined
          ].join(' ');
          
          msg = msg
            .replace(/\$\[member:nickname]/g, m && m.nick ? this.bot.util.escapeMarkdown(m.nick) : '*No nickname set*')
            .replace(/\$\[member:roles]/g, m.roles.length >= 1 ? this._limit(m.roles.map((v) => `<@&${v}>`), 25).join(' **/** ') : 'none')
            .replace(/\$\[member:created@exact]/g, moment(m.joinedAt).format('YYYY[/]MM[/]DD HH[:]mm'))
            .replace(/\$\[member:created@precise]/g, m.cs);
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