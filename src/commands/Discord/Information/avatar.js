const { DiscordCommand } = require('../../../core');

const w                = require('wumpfetch');
const sizeOf           = require('../../../util/sizeOf');
const { extname }      = require('path');
const { readFileSync } = require('fs');
// Sharp is an optional dependency
let sharp;
try {
  sharp = require('sharp');
} catch (ex) {
  throw new Error('Sharp not found, not loading this command');
}

module.exports = class Avatar extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'avatar',
      syntax     : 'avatar [...user:string] [--large] [--(nearest|linear)] [--greyscale] [--jpeg] [--blur]',
      aliases    : [ 'avt', 'pfp' ],
      argument   : [ '[...user:string]', '[--large]', '[--(nearest|linear)]', '[--greyscale]', '[--jpeg]', '[--blur]' ],
      description: 'Get a user\'s avatar',

      hidden     : false,
      enabled    : true,
      cooldown   : 5000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
    
    this.static = {
      reg: [ /--large/i, /--(nearest|linear)/i, /--greyscale/i, /--jpeg/i, /--blur/i ],
      REQ_DATA: {
        headers: {
          'User-Agent'   : this.bot.ua,
          'Authorization': this.bot.conf.api.dbl
        }
      }
    };

    try {
      this.static.thumb = readFileSync('./assets/img/thumb/votelocked.png');
    } catch (ex) {
      this.static.thumb = undefined;
    }

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
    const oArgs  = args;
    const edited = this.static.reg[0].test(oArgs) || this.static.reg[1].test(oArgs) || this.static.reg[2].test(oArgs) || this.static.reg[3].test(oArgs) || this.static.reg[4].test(oArgs);
    const extras = `${this.static.reg[2].exec(oArgs) ? 'GREYSCALE' : ''} ${this.static.reg[3].exec(oArgs) ? 'JPEG' : ''} ${this.static.reg[4].exec(oArgs) ? 'BLUR' : ''}`;
    const resize =
      this.static.reg[1].test(args) && this.static.reg[1].exec(args)[0].toLowerCase() === '--nearest' ? 'NEAREST' :
      this.static.reg[1].test(args) && this.static.reg[1].exec(args)[0].toLowerCase() === '--linear'  ? 'LINEAR_A' : 'LINEAR_B';

    args = args
      .join(' ')
      .trim()
      .replace(this.static.reg[0], '')
      .replace(this.static.reg[1], '')
      .replace(this.static.reg[2], '')
      .replace(this.static.reg[3], '')
      .replace(this.static.reg[4], '')
      .split(' ')
      .filter((v) => { return v !== ''; });

      let user        = this.bot.REST.getUser(args[0] ? args.join(' ') : msg.author.id);
      if (!user) user = this.bot.users.get(msg.author.id);

      let img;
      const avatarURL = (user.avatar ? user.avatarURL : user.defaultAvatarURL).split('?')[0];

    if (edited) {
      const manipulate = async () => {
        let tmp, dim;

        tmp = await w(avatarURL).send(); 
        tmp = tmp.body;

        if (this.static.reg[0].test(oArgs)) {
          dim = sizeOf(tmp);
          tmp = await sharp(tmp)
            .resize(dim.width * 2, dim.height * 2, {
              kernel: resize === 'LINEAR_B' ? sharp.kernel.linearB :
              resize === 'LINEAR_A' ? sharp.kernel.linearA :
              resize === 'NEAREST' ? sharp.kernel.nearest :
              sharp.kernel.linearA
            }) // { fit: 'inside' }
            .toBuffer();
        }

        if (this.static.reg[2].test(oArgs)) tmp = await sharp(tmp).greyscale().toBuffer();
        if (this.static.reg[3].test(oArgs)) tmp = await sharp(tmp).jpeg({ quality: 5 }).toBuffer();
        if (this.static.reg[4].test(oArgs)) tmp = await sharp(tmp).blur(4).toBuffer();

        return tmp;
      };

      const voters = this.bot.cache.get('votes') ? this.bot.cache.get('votes') : this.bot.cache.set('votes', []) && this.bot.cache.get('votes');
      if (!this.bot.op(msg.author.id) && !voters.includes(msg.author.id)) {
        const req = await w(`https://discordbots.org/api/bots/318057009188438016/check?userId=${msg.author.id}`, this.static.REQ_DATA).send();
        const res = req.json();

        if(req.statusCode !== 200) {
          img = await manipulate();
        } else {
          if (res.voted === 0) {
            return msg.channel.createMessage({
              embed: {
                color: this.bot.col.votelock,
                thumbnail: {
                  url: 'attachment://thumb.png'
                },
                description: this._localize(msg.author.locale.votelock.join('\n'), { votelocked: true })
              }
            }, this.static.thumb ? { file: this.static.thumb, name: 'thumb.png' } : undefined);
          } else if (res.voted === 1) {
            img = await manipulate();
            voters.push(msg.author.id);
          }
        }
      } else {
        img = await manipulate();
      }
    } else {
      img = await w(avatarURL).send();
      img = img.body;
    }

    msg.channel.createMessage({
      embed: {
        color: this.bot.col.info.avatar,
        image: {
          url: `attachment://thumb${edited ? '.jpg' : extname(avatarURL)}`
        },
        description: `${this._localize(msg.author.locale.info.avatar, { user: user })} (\`${this.static.reg[0].test(oArgs.join(' ')) ? 'LARGE' : 'DEFAULT'} ${resize} ${extras}\`)`
      }
    }, {
      file: img,
      name: `thumb${edited ? '.jpg' : extname(avatarURL)}`
    });
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      if (extData) {
        if (extData.user) {
          msg = msg.replace(/\$\[user:full]/g, `${extData.user.username}'${!extData.user.username.toLowerCase().endsWith('s') ? 's' : ''}`);
        }
        if (extData.votelocked) {
          return msg
            .replace(/\$\[emoji#0]/g, this.bot.emote('votelock', '0'))
            .replace(/\$\[emoji#1]/g, this.bot.emote('votelock', '1'));
        }
      }
      
      return msg
        .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'avatar'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};