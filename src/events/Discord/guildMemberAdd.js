const { DiscordEvent } = require('../../core');

const moment = require('moment'); require('../../util/moment/diff');
const { get } = require('wumpfetch');
const { yellow } = require('../../util/colors');

module.exports = class GuildMemberAdd extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'guildMemberAdd' });

    this.static = {
      BASE_URL: [
        'https://discord.services',
        'https://api.ksoft.si'
      ],
      REQ_DATA: [
        {
          parse: 'json',
          headers: {
            'User-Agent': this.bot.ua
          }
        },
        {
          parse: 'json',
          headers: {
            'User-Agent': this.bot.ua,
            'Authorization': this.bot.conf.api.ksoft
          }
        }
      ]
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async emit(guild, member) {
    /*----------[ Logging ]---------- */
    let entry = {};
    let cache = this.bot.cache.has('guilds') ? this.bot.cache.get('guilds') : this.bot.cache.set('guilds', []) && this.bot.cache.get('guilds');
     

    if (!this._checkArray('guildId', guild.id, cache)) {
      this.bot.m.connection.collection('dGuilds').findOne({ guildId: guild.id }, async (err, doc) => {
        if (err) {
          process.handleError(err, 'IndexError', yellow('Database'));
        }

        if (doc === null) {
          entry = new this.bot.schema.guild({ guildId: guild.id });
          entry.save((err) => {
            if (err) process.handleError(err, 'InsertError', yellow('Database'));
          });

          cache.push({
            'prefix': entry.prefix,
            'logger': entry.logger,
            'locale': entry.locale,
            'guildId': guild.id,
            'entryAge': Date.now()
          });
        } else {
          entry = await this.bot.m.connection.collection('dGuilds').findOne({ guildId: guild.id });
          
          cache.push({
            'prefix': entry.prefix,
            'logger': entry.logger,
            'locale': entry.locale,
            'guildId': guild.id,
            'entryAge': Date.now()
          });
        }
      });
    } else {
      entry = cache.filter((v) => v.guildId === guild.id)[0];
    }

    if (entry && entry.logger && entry.logger.channel !== '0' && !entry.logger.disabled.includes(this.extData.name)) {
      try {
        const strings = this.bot.locales.has(`${entry.locale}:LOGS`) ? this.bot.locales.get(`${entry.locale}:LOGS`) : this.bot.locales.get(`${this.bot.conf.discord.locale}:LOGS`);
        const prohibited = new RegExp((this.bot.locales.get('badwords') || []).join('|'), 'gi');

        member.bans = {
          'ksoft.si': this.bot.conf.api.ksoft ? await get(`${this.static.BASE_URL[1]}/bans/info?user=${member.id}`, this.static.REQ_DATA[1]).send() : undefined,
          'discord.services': await get(`${this.static.BASE_URL[0]}/api/ban/${member.id}`, this.static.REQ_DATA[0]).send()
        };


        member.c = moment.preciseDiff(new Date(), new Date(member.createdAt), true);
        let notes = [];

        if (prohibited.test(member.username)) {
          notes.push(`${this.bot.emote('logs', 'message_delete', '1')} ${strings.member.add.notes[0]}`);
        }

        if (member.c.days <= 0 && member.c.months <= 0 && member.c.years <= 0) {
          notes.push(`${this.bot.emote('logs', 'message_delete', '2')} ${strings.member.add.notes[1]}`);
        }

        if (!member.avatar) {
          notes.push(`${this.bot.emote('logs', 'message_delete', '3')} ${strings.member.add.notes[2]}`);
        }

        if (member.bans['discord.services'] && member.bans['discord.services'].body.msg !== 'No ban found') {
          notes.push(`${this.bot.emote('logs', 'message_delete', '4')} ${strings.member.add.notes[3].replace(/{e\.ban\.reason}/, member.bans['discord.services'].body.reason || 'Unknown')}`);
        }
        if (member.bans['ksoft.si'] && !member.bans['ksoft.si'].body.code) {
          notes.push(`${this.bot.emote('logs', 'message_delete', '5')} ${strings.member.add.notes[4].replace(/{e\.ban\.reason}/, member.bans['ksoft.si'].body.reason || 'Unknown')}`);
        }

        this.bot.createMessage(entry.logger.channel, {
          content: this._localize(strings.member.add.main, member),
          embed: {
            description: notes.length >= 1 ? notes.join('\n') : undefined
          }
        });
      } catch (ex) {
        throw ex;
      }
    }
  }

  _checkArray(field, needle, array) {
    if (array instanceof Array) {
      return array.some((v) => {
        return v[field] === needle;
      });
    } else {
      return false; 
    }
  }

  _localize(msg, extData) {
    if (extData) {
      extData.creation = {
        date: moment(extData.createdAt).format('YYYY[/]MM[/]DD HH[:]mm'),
        precise: [
          extData.c.years >= 1 ? `${extData.c.years} years` : undefined,
          extData.c.months >= 1 ? `${extData.c.months} months` : undefined,
          extData.c.days >= 1 ? `${extData.c.days} days` : undefined,
          extData.c.days <= 0 && extData.c.months <= 0 && extData.c.years <= 0 ? 'Less than a day' : undefined
        ].join(' ').trim()
      };

      msg = msg
        .replace(/{e\.user!s}/g, `${extData.username}#${extData.discriminator}`)
        .replace(/{e\.user\.id}/g, extData.id)
        .replace(/{e\.user\.created@exact}/g, extData.creation.date)
        .replace(/{e\.user\.created@precise}/g, extData.creation.precise);
    }

    return msg
      .replace(/{emoji}/g, this.bot.emote('logs', 'message_delete', '0'))
      .replace(/{date@now}/g, moment(new Date).format(`HH[:]mm[:]ss[.]SS`));
  }
};