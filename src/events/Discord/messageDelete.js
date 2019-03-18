const { DiscordEvent } = require('../../core');

const moment = require('moment');
const { yellow } = require('../../util/colors');
module.exports = class MessageDelete extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'messageDelete' });

    this.static = {
      EMBED_FIELD_LIMIT: 1024
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  emit(msg) {
    if (!msg.channel.guild || !msg.author || !this.bot.ready) return;
    this.bot.cache.set(`${msg.channel.id}:SNIPE`, msg);
    
    if (msg.author.id === this.bot.user.id) return;

    let guild = {};
    let cache = this.bot.cache.has('guilds') ? this.bot.cache.get('guilds') : this.bot.cache.set('guilds', []) && this.bot.cache.get('guilds');

    if (!this._checkArray('guildId', msg.channel.guild.id, cache)) {
      this.bot.m.connection.collection('dGuilds').findOne({ guildId: msg.channel.guild.id }, async (err, doc) => {
        if (err) {
          process.handleError(err, 'IndexError', yellow('Database'));
        }

        if (doc === null) {
          guild = new this.bot.schema.guild({ guildId: msg.channel.guild.id });
          guild.save((err) => {
            if (err) process.handleError(err, 'InsertError', yellow('Database'));
          });
          
          cache.push({
            'prefix': guild.prefix,
            'logger': guild.logger,
            'locale': guild.locale,
            'guildId': msg.channel.guild.id,
            'entryAge': Date.now()
          });
        } else {
          guild = await this.bot.m.connection.collection('dGuilds').findOne({ guildId: msg.channel.guild.id });
          
          cache.push({
            'prefix': guild.prefix,
            'logger': guild.logger,
            'locale': guild.locale,
            'guildId': msg.channel.guild.id,
            'entryAge': Date.now()
          });
        }
      });
    } else {
      guild = cache.filter((v) => v.guildId === msg.channel.guild.id)[0];
    }

    if (guild && guild.logger && guild.logger.channel !== '0' && msg.channel.id !== guild.logger.channel && !guild.logger.disabled.includes(this.extData.name)) {
      try {
        const strings = this.bot.locales.has(`${guild.locale}:LOGS`) ? this.bot.locales.get(`${guild.locale}:LOGS`) : this.bot.locales.get(`${this.bot.conf.discord.locale}:LOGS`);

        let structure = {
          author: {
            name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
            icon_url: msg.author.avatar ? msg.author.avatarURL : msg.author.defaultAvatarURL
          },
          color: this.bot.col.logs.message.delete,
          fields: [],
          timestamp: new Date(msg.timestamp).toISOString()
        };
    
        if (msg.embeds.length > 0) {
          if ('url' in msg.embeds[0]) structure.url = msg.embeds[0].url;
          if ('type' in msg.embeds[0]) structure.type = msg.embeds[0].type;
          if ('title' in msg.embeds[0]) structure.title = msg.embeds[0].title;
          if ('image' in msg.embeds[0]) structure.image = msg.embeds[0].image;
          if ('video' in msg.embeds[0]) structure.video = msg.embeds[0].video;
          if ('fields' in msg.embeds[0]) structure.fields = msg.embeds[0].fields;
          if ('provider' in msg.embeds[0]) structure.provider = msg.embeds[0].provider;
          if ('thumbnail' in msg.embeds[0]) structure.thumbnail = msg.embeds[0].thumbnail;
          if ('description' in msg.embeds[0]) {
            if (msg.content === '') {
              structure.description = msg.embeds[0].description;
            } else {
              if (msg.embeds[0].description.length <= this.static.EMBED_FIELD_LIMIT) {
                structure.description = msg.content;
                structure.fields.push({
                  name: 'Embed body',
                  value: msg.embeds[0].description
                });
              } else if (msg.embeds[0].description.length >= this.static.EMBED_FIELD_LIMIT) {
                structure.description = msg.content;
                structure.fields.push({
                  name: msg.author.locale.util.snipe.embed,
                  value: msg.embeds[0].description.substring(0, this.static.EMBED_FIELD_LIMIT)
                },
                {
                  name: '.',
                  value: msg.embeds[0].description.substring(this.static.EMBED_FIELD_LIMIT, this.static.EMBED_FIELD_LIMIT * 2)
                });
              }
            };
          }
        }

        if (msg.content.length >= 1) {
          structure.description = msg.content;
        }
    
        if (!('image' in structure) && msg.attachments.length > 0) {
          structure.image = {
            url: msg.attachments[0].url,
            width: msg.attachments[0].width,
            height: msg.attachments[0].height,
            proxy_url: msg.attachments[0].proxy_url
          };
        }

        this.bot.createMessage(guild.logger.channel, {
          content: this._localize(strings.message.delete, msg),
          embed: structure
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
      msg = msg
        .replace(/{e\.user!s}/, `${extData.author.username}#${extData.author.discriminator}`)
        .replace(/{e\.user\.id}/, extData.author.id)
        .replace(/{e\.channel!s}/, `#${extData.channel.name}`);
    }

    return msg
      .replace(/{emoji}/, this.bot.emote('logs', 'message', 'delete'))
      .replace(/{date@now}/, moment(new Date).format(`HH[:]mm[:]ss`));
  }
};