const { DiscordCommand } = require('../../../core');

const w           = require('wumpfetch');
const sizeOf      = require('../../../util/sizeOf');
const { extname } = require('path');

let s;
try { s = require('sharp'); }
catch (ex) { throw new Error('Sharp not found, not loading this command'); }

module.exports = class Avatar extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'avatar',
      syntax     : 'avatar [...user:string] [--large] [--(nearest|linear)]',
      aliases    : [ 'avt', 'pfp' ],
      argument   : [ '[...user:string]', '[--large]', '[--(nearest|linear)]' ],
      description: 'Get a user\'s avatar',

      hidden     : false,
      enabled    : true,
      cooldown   : 5000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.regex = [/--large/i, /--(nearest|linear)/i, /--greyscale/i];
  }

  async execute(msg, args) {
    const resize =
    this.regex[1].test(args) && this.regex[1].exec(args)[0].toLowerCase() === '--nearest' ? 'NEAREST' :
    this.regex[1].test(args) && this.regex[1].exec(args)[0].toLowerCase() === '--linear'  ? 'LINEAR_A' : 'LINEAR_B';
    
    const oldArgs   = args;
    args            = args.join(' ').trim().replace(this.regex[0], '').replace(this.regex[1], '').replace(this.regex[2], '').split(' ').filter((v) => { return v !== ''; });
    let user        = this.bot.REST.getUser(args[0] ? args.join(' ') : msg.author.id);
    if (!user) user = this.bot.users.get(msg.author.id);

    let img, dim;
    const avatarURL = (user.avatar ? user.avatarURL : user.defaultAvatarURL).split('?')[0];

    if (this.regex[0].test(oldArgs.join(' '))) {
      img = await w(avatarURL).send(); 
      img = img.body;

      dim = sizeOf(img);
      img = await s(img)
        .resize(dim.width * 2, dim.height * 2, { kernel: resize === 'LINEAR_B' ? s.kernel.linearB : resize === 'LINEAR_A' ? s.kernel.linearA : resize === 'NEAREST' ? s.kernel.nearest : s.kernel.linearA }) // { fit: 'inside' }
        .toBuffer();
      if (this.regex[2].exec(args)) img = await s(img).greyscale().toBuffer();
    } else {
      img = await w(avatarURL).send();
      img = img.body;
    }

    if (this.regex[2].test(oldArgs)) img = await s(img).greyscale().toBuffer();

    msg.channel.createMessage({
      embed: {
        image: { url: `attachment://thumb${extname(avatarURL)}` },
        color: this.bot.col['info']['avatar'],
        description: `${this.localize(msg.author.locale['info']['avatar'], { user: user })} (\`${this.regex[0].test(oldArgs.join(' ')) ? 'LARGE' : 'DEFAULT'} ${resize} ${this.regex[2].exec(oldArgs) ? 'GREYSCALE' : ''}\`)`
      }
    }, {
      file: img,
      name: `thumb${extname(avatarURL)}`
    });
  }

  localize(msg, extData) {
    if (!msg) return '';

    return msg
      .replace(/\$\[user:full]/g, `${extData.user.username}'${!extData.user.username.toLowerCase().endsWith('s') ? 's' : ''}`)
      .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'avatar'));
  }
};