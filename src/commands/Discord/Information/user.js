const { DiscordCommand } = require('../../../core');

const m = require('moment'); require('../../../util/moment/diff.js');

module.exports = class Guild extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'user',
      syntax      : 'user <...user:string>',
      aliases     : [ '<...user:string>' ],
      argument    : [],
      description : 'Get a user\'s information',

      hidden      : false,
      enabled     : true,
      cooldown    : 1000,
      category    : 'Information',
      ownerOnly   : false,
      guildOnly   : false,
      permissions : [ 'embedLinks' ]
    });

    this.mutable.status = {
      '_unknown': `${this.bot.emote('info', 'user', '6')}Unknown`,
      'online'  : `${this.bot.emote('info', 'user', '7')}online`,
      'idle'    : `${this.bot.emote('info', 'user', '8')}away`,
      'dnd'     : `${this.bot.emote('info', 'user', '9')}do not disturb`,
      'offline' : `${this.bot.emote('info', 'user', '10')}offline`
    };
  }

  async execute(msg, args) {
    const u = this.bot.REST.getUser((args.length >= 1 ? args.join(' ') : msg.author.id));
    if (!u) return msg.channel.createMessage(this._localize(msg.author.locale['info']['user']['invalid']));    
    
    const mem = msg.channel.guild && msg.channel.guild.members.get(u.id) ? msg.channel.guild.members.get(u.id) : undefined;
    
    const structure = {
      embed: {
        color: this.bot.col['info']['guild'],
        thumbnail: {
          url: u.avatar ? u.avatarURL : u.defaultAvatarURL
        },
        fields: [
          {
            name: msg.author.locale['info']['user']['fields']['self']['name'],
            value: this._localize(msg.author.locale['info']['user']['fields']['self']['value'].join('\n'), { user: u, member: mem }),
            inline: true
          }
        ]
      }
    };

    if (mem) {
      structure.embed.fields.push({
        name: msg.author.locale['info']['user']['fields']['member']['name'],
        value: this._localize(msg.author.locale['info']['user']['fields']['member']['value'].join('\n'), { user: u, member: mem, guildId: msg.channel.guild.id }),
        inline: true
      });
    }

    msg.channel.createMessage(structure);
  }

  _localize(msg, extData) {
    if (!msg) return '';
    if (extData) {
      if (extData.user) {
        const u    = extData.user;
        u.c  = m.preciseDiff(new Date(), new Date(u.createdAt), true);
        u.cs = [
          u.c.years >= 1  ?  `${u.c.years} years`  : undefined,
          u.c.months >= 1 ? `${u.c.months} months` : undefined,
          u.c.days >= 1   ? `${u.c.days} days`     : undefined,
          u.c.days <= 0 && u.c.months <= 0 && u.c.years <= 0 ? 'Less than a day' : undefined
        ].join(' ');
        
        msg = msg
        .replace(/\$\[user:id]/g , u.id)
        .replace(/\$\[user:tag]/g , `${u.username}#${u.discriminator}`)
        .replace(/\$\[user:created@exact]/g, m(u.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'))
        .replace(/\$\[user:created@precise]/g, u.cs)
        .replace(/\$\[user:status@full]/g, extData.member && this.mutable.status[extData.member.status] ? this.mutable.status[extData.member.status] : this.mutable.status['_unknown']);
      }
      if (extData.member) {
        const mem = extData.member;
        mem.c  = m.preciseDiff(new Date(), new Date(mem.joinedAt), true);
        mem.cs = [
          mem.c.years >= 1  ?  `${mem.c.years} years`  : undefined,
          mem.c.months >= 1 ? `${mem.c.months} months` : undefined,
          mem.c.days >= 1   ? `${mem.c.days} days`     : undefined,
          mem.c.days <= 0 && mem.c.months <= 0 && mem.c.years <= 0 ? 'Less than a day' : undefined
        ].join(' ');
        msg = msg
        .replace(/\$\[member:nickname]/g, mem && mem.nick ? this.bot.util.escapeMarkdown(mem.nick) : '*No nickname set*')
        .replace(/\$\[member:roles]/g, mem.roles.length >= 1 ? mem.roles.map((v) => `<@&${v}>`).slice(0, 25).join(' **/** ') : 'n/a')
        .replace(/\$\[member:created@exact]/g, m(mem.joinedAt).format('YYYY[/]MM[/]DD HH[:]mm'))
        .replace(/\$\[member:created@precise]/g, mem.cs);
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
  }
};