const { DiscordCommand } = require('../../../core');

const w                = require('wumpfetch');
const sizeOf           = require('../../../util/sizeOf');
const { extname }      = require('path');
const { readFileSync } = require('fs');
// Sharp is an optional dependency
let s;
try { s = require('sharp'); }
catch (ex) { throw new Error('Sharp not found, not loading this command'); }

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
    
    this.mutable = {
      reg: [ /--large/i, /--(nearest|linear)/i, /--greyscale/i, /--jpeg/i, /--blur/i ],
      req: {
        headers: {
          'User-Agent'   : this.bot.ua,
          'Authorization': this.bot.conf.api.dbl
        }
      }
    };

    try { this.mutable.thumb = readFileSync('./assets/img/thumb/votelocked.png'); }
    catch(ex) { this.thumb = undefined; }
  }

  async execute(msg, args) {
    // Resizing method, original args, extras and edited
    const oArgs  = args;
    const edited = this.mutable.reg[0].test(oArgs) || this.mutable.reg[1].test(oArgs) || this.mutable.reg[2].test(oArgs) || this.mutable.reg[3].test(oArgs) || this.mutable.reg[4].test(oArgs);
    const extras = `${this.mutable.reg[2].exec(oArgs) ? 'GREYSCALE' : ''} ${this.mutable.reg[3].exec(oArgs) ? 'JPEG' : ''} ${this.mutable.reg[4].exec(oArgs) ? 'BLUR' : ''}`;
    const resize =
      this.mutable.reg[1].test(args) && this.mutable.reg[1].exec(args)[0].toLowerCase() === '--nearest' ? 'NEAREST' :
      this.mutable.reg[1].test(args) && this.mutable.reg[1].exec(args)[0].toLowerCase() === '--linear'  ? 'LINEAR_A' : 'LINEAR_B';
    // Strip args
    args = args
      .join(' ')
      .trim()
      .replace(this.mutable.reg[0], '')
      .replace(this.mutable.reg[1], '')
      .replace(this.mutable.reg[2], '')
      .replace(this.mutable.reg[3], '')
      .replace(this.mutable.reg[4], '')
      .split(' ')
      .filter((v) => { return v !== ''; });
      // Fetch user
      let user        = this.bot.REST.getUser(args[0] ? args.join(' ') : msg.author.id);
      if (!user) user = this.bot.users.get(msg.author.id);
      // Base avatar URL of `user`
      let img;
      const avatarURL = (user.avatar ? user.avatarURL : user.defaultAvatarURL).split('?')[0];

    if (edited) {
      // Image manipulation
      const manipulate = async () => {
        let tmp, dim;
        // Fetching avatar of `user`
        tmp = await w(avatarURL).send(); 
        tmp = tmp.body;
        // Resizing
        dim = sizeOf(tmp);
        tmp = await s(tmp)
          .resize(dim.width * 2, dim.height * 2, { kernel: resize === 'LINEAR_B' ? s.kernel.linearB : resize === 'LINEAR_A' ? s.kernel.linearA : resize === 'NEAREST' ? s.kernel.nearest : s.kernel.linearA }) // { fit: 'inside' }
          .toBuffer();
        // Utility customization
        if (this.mutable.reg[2].test(oArgs)) tmp = await s(tmp).greyscale().toBuffer();
        if (this.mutable.reg[3].test(oArgs)) tmp = await s(tmp).jpeg({ quality: 5 }).toBuffer();
        if (this.mutable.reg[4].test(oArgs)) tmp = await s(tmp).blur(4).toBuffer();

        return tmp;
      };
      // Vote lock
      const voters = this.bot.cache.get('votes') ? this.bot.cache.get('votes') : this.bot.cache.set('votes', []) && this.bot.cache.get('votes');
      if (!this.bot.op(msg.author.id) && !voters.includes(msg.author.id)) {
        // Fetch votes
        const req = await w(`https://discordbots.org/api/bots/318057009188438016/check?userId=${msg.author.id}`, this.mutable.req).send();
        const res = req.json();
        // Succeed if code isn't `200`
        if(req.statusCode !== 200) {
          img = await manipulate();
        } else {
          if (res.voted === 0) {
            // User didn't vote
            return msg.channel.createMessage({
              embed: {
                color      : this.bot.col['votelock'],
                thumbnail  : { url: 'attachment://thumb.png' },
                description: this.localize(msg.author.locale['votelock'].join('\n'), { votelocked: true })
              }
            }, this.mutable.thumb ? { file: this.mutable.thumb, name: 'thumb.png' } : undefined);
          } else if (res.voted === 1) {
            // User voted
            img = await manipulate();
            voters.push(msg.author.id);
          }
        }
      } else {
        img = await manipulate();
      }
    } else {
      // Fetching avatar of `user`
      img = await w(avatarURL).send();
      img = img.body;
    }

    msg.channel.createMessage({
      embed: {
        image      : { url: `attachment://thumb${edited ? '.jpg' : extname(avatarURL)}` },
        color	     : this.bot.col['info']['avatar'],
        description: `${this.localize(msg.author.locale['info']['avatar'], { user: user })} (\`${this.mutable.reg[0].test(oArgs.join(' ')) ? 'LARGE' : 'DEFAULT'} ${resize} ${extras}\`)`
      }
    }, {
      file: img,
      name: `thumb${edited ? '.jpg' : extname(avatarURL)}`
    });
  }

  localize(msg, extData) {
    if (!msg) return '';
    
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
  }
};