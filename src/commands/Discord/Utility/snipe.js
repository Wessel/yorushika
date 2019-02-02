const { DiscordCommand } = require('../../../core/');

module.exports = class Snipe extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'snipe',
      syntax     : 'snipe',
      aliases    : [],
      argument   : [],
      description: 'Re-post a deleted message',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Utility',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  execute(msg) {
    const message = this.bot.cache.get(`${msg.channel.id}:SNIPE`);
    if (!message) return msg.channel.createMessage(this.localize(msg.author.locale['util']['snipe']['fail']));
    
    let structure = {
      author    : {
        name    : `${message.author.username}#${message.author.discriminator} (${message.author.id})`,
        icon_url: message.author.avatar ? message.author.avatarURL : message.author.defaultAvatarURL
      },
      color     : this.bot.col['util']['snipe'],
      footer    : {
        text    : this.localize(msg.author.locale['util']['snipe']['footer'], { msg: msg }),
        icon_url: msg.author.avatar ? msg.author.avatarURL : msg.author.defaultAvatarURL
      },
      timestamp: new Date(message.timestamp).toISOString()
    };

    if (message.embeds.length > 0 && 'url'         in message.embeds[0]) structure.url         = message.embeds[0].url;
    if (message.embeds.length > 0 && 'type'        in message.embeds[0]) structure.type        = message.embeds[0].type;
    if (message.embeds.length > 0 && 'title'       in message.embeds[0]) structure.title       = message.embeds[0].title;
    if (message.embeds.length > 0 && 'image'       in message.embeds[0]) structure.image       = message.embeds[0].image;
    if (message.embeds.length > 0 && 'video'       in message.embeds[0]) structure.video       = message.embeds[0].video;
    if (message.embeds.length > 0 && 'fields'      in message.embeds[0]) structure.fields      = message.embeds[0].fields;
    if (message.embeds.length > 0 && 'provider'    in message.embeds[0]) structure.provider    = message.embeds[0].provider;
    if (message.embeds.length > 0 && 'thumbnail'   in message.embeds[0]) structure.thumbnail   = message.embeds[0].thumbnail;
    if (message.embeds.length > 0 && 'description' in message.embeds[0]) structure.description = (`${message.content ? message.content : ''}\n\n${message.embeds[0].description}`).slice(0, 2048);
    else if (message.content !== '' ) structure.description = message.content;
    if (!('image' in structure) && message.attachments.length > 0) {
      structure.image = {
        url      : message.attachments[0].url,
        width    : message.attachments[0].width,
        height   : message.attachments[0].height,
        proxy_url: message.attachments[0].proxy_url
      };
    }

    msg.channel.createMessage({ embed: structure });
    this.bot.cache.delete(`${msg.channel.id}:SNIPE`);
  }

  localize(msg, extData) {
    if (!msg) return '';

    if (extData && extData.msg) msg = msg
      .replace(/\$\[author:tag]/g, `${extData.msg.author.username}#${extData.msg.author.discriminator}`)
      .replace(/\$\[author:id]/g, extData.msg.author.id);

    return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('util', 'snipe'));
  }
};