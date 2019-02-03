const moment                                 = require('moment'); require('../../../util/moment/format');
const { safeLoad }                           = require('js-yaml');
const { Collection }                         = require('eris');
const { red, green, yellow, cyan }           = require('../../../util/colors');
const { readdir, readdirSync, readFileSync } = require('fs');

const Context = require('../../internal/Discord/Context');
const startTimestamp     = Date.now();

module.exports = class CommandRegistry {
  constructor(bot) {
    this.bot        = bot;
    this.ratelimits = new Collection();
  }

  start(directory, category, file) {
    try {
      const cmd            = new(require(`${directory}/${category}/${file}`))(this.bot);
      cmd.extData.location = `${directory}/${category}/${file}`;
      
      if (!cmd.extData.enabled) return;
      if (!this.bot.conf['discord']['commands'][cmd.extData.name]) return;
      if (this.bot.cmds.has(cmd.extData.name)) return this.bot.print(1, `${cyan('Discord')} -- Duplicate command found - ${red(`${directory}/${category}/${file}`)}` );
    
      this.bot.cmds.set(cmd.extData.name, cmd);
      this.bot.print(2, `${cyan('Discord')} ++ Loaded command ${green(cmd.extData.name)} in ${yellow(`${(Date.now() - startTimestamp)}ms`)}`);
    } catch (ex) { this.bot.print(1, `${cyan('Discord')} >> ${yellow(`${directory}/${category}/${file}`)} ${red(`is not a valid command: ${ex.message}`)}`); }
  }

  async run(directory) {
    const categories = await readdirSync(directory);

    for (let i = 0; i < categories.length; i++) {
      if (categories[i].endsWith('md')) return;
      readdir(`${directory}/${categories[i]}`, (err, cmds) => {
        if (err) process.handleError(err, cyan('Discord'), 'LoadError');
        this.bot.print(1, `${cyan('Discord')} >> Loading ${green(cmds.length)} commands from category ${yellow(categories[i])}` );

        cmds.forEach((cmd) => {
          try {
            this.start(directory, categories[i], cmd);
          } catch(ex) { process.handleError(err, cyan('Discord'), 'LoadError'); }
        });
      });
    }
  }

  reload(command = 'ping') {
    const cmd = this.bot.cmds.get(command);
    const dir = cmd ? cmd.extData.location : undefined;
    
    if (!cmd || !dir) return false;

    delete require.gCache[require.resolve(dir)];
    this.bot.cmds.delete(command);
    this.start(dir);
    return true;
  }

  async handleCommand(msg) {
    let perm;
    let guild, user;
    let prefix;
    let gCache, uCache;

    if (msg.author.bot || !this.bot.ready) return;
    if (msg.channel.guild) {
      perm   = msg.channel.permissionsOf(this.bot.user.id);
      gCache = this.bot.cache.has('guilds') ? this.bot.cache.get('guilds') : this.bot.cache.set('guilds', []) && this.bot.cache.get('guilds');
      uCache = this.bot.cache.has('users')  ? this.bot.cache.get('users')  : this.bot.cache.set('users', [])  && this.bot.cache.get('users');
      if (!this.checkArray('guildId', msg.channel.guild.id, gCache)) {
        guild = await this.bot.m.connection.collection('dGuilds').findOne({ guildId: msg.channel.guild.id });
        if (guild === null || !guild) {
          guild = new this.bot.schema.guild({ guildId: msg.channel.guild.id });
          await guild.save((err) => { if (err) process.handleError(err); });
        } else gCache.push({ 'guildId': msg.channel.guild.id, 'prefix': guild.prefix, 'entryAge': Date.now() });
      } else guild = gCache.filter((v) => v['guildId'] === msg.channel.guild.id );

      if (!this.checkArray('userId', msg.author.id, uCache)) {
        user = await this.bot.m.connection.collection('dUsers').findOne({ userId: msg.author.id });
        if (user === null || !user) {
          user = new this.bot.schema.user({ userId: msg.author.id });
          await user.save((err) => { if (err) process.handleError(err); });
        } else uCache.push({ 'userId': msg.author.id, locale: user.locale ? user.locale : this.bot.conf['discord']['locale'], 'entryAge': Date.now() });
      } else user = uCache.filter((v) => v['userId'] === msg.author.id )[0];
      msg.author.locale = this.bot.locales.get(user['locale'] ? user['locale'] : 'en_us');

        prefix = new RegExp([
        `^<@!?${this.bot.user.id}> `,
        `^${this.bot.conf['discord']['prefix'].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
        `^${guild && guild['prefix'] ? guild['prefix'].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') : this.bot.conf['discord']['prefix'].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`
      ].join('|')).exec(msg.content.toLowerCase());
    } else {
      guild  = undefined;
      prefix = /(?:)/.exec(msg['content'].toLowerCase());
    }

    if (!prefix) return;

    const ctx = new Context(this.bot, msg);
    ctx.setPrefix(prefix);

    const args = msg.content.slice(prefix[0].length).trim().split(/ +/g);
    let cmd    = args.shift().toLowerCase();
        cmd    = this.bot.cmds.filter((v) => v.extData.name.toLowerCase() === cmd || v.extData.aliases.includes(cmd));

    if (cmd.length > 0) {
      user['entryAge']  = Date.now();
      guild['entryAge'] = Date.now();
      cmd = cmd[0];

      if (cmd.extData.ownerOnly && !this.bot.op(msg.author.id)) 
        return msg.channel.createMessage(`${this.bot.emote('owner_only')} ${msg.author.mention} **>** You don't have enough permissions to execute this command (\`BOT_OP\`)`);

      if (cmd.extData.guildOnly && msg.channel.type === 1) 
        return msg.channel.createMessage( `${this.bot.emote('guild_only')} ${msg.author.mention} **>** This command can only be used in guilds` );
      
        if (msg.channel.guild && (cmd.extData.permissions && cmd.extData.permissions.some((v) => !perm.has(v))) ||
          msg.channel.guild && !perm.has('sendMessages')) return;

      if (!this.ratelimits.has(cmd.extData.name)) this.ratelimits.set(cmd.extData.name, []);

      const now            = Date.now();
      const timestamps     = this.ratelimits.get(cmd.extData.name);
      const cooldownUser   = timestamps.find((v) => v.authorId === msg.author.id);
      const cooldownAmount = !this.bot.op(msg.author.id) ? (cmd.extData.cooldown) : 0;

      if (!cooldownUser) {
        timestamps.push({ authorId: msg.author.id, date: now });
        setTimeout(() => {
          const _ = timestamps.findIndex((v) => v.authorId === msg.author.id);
          if (_ > -1) timestamps.splice(_, 1);
          else return false;
        }, cooldownAmount);
      } else {
        const expirationTime = cooldownUser.date + cooldownAmount;

        if (now <= expirationTime) {
          const timeLeft = (expirationTime - now);

          return msg.channel.createMessage({
            embed: {
              color      : this.bot.col['cooldown'],
              description: this.localize(msg.author.locale['cooldown'], { left: moment.duration(timeLeft).format('YYYY[y] M[M] DD[d] H[h] m[m] s[S] SS[ms]'), author: msg.author })
            }
          });
        }
      }

      try {
        await cmd.execute(ctx, args, user, guild);
        this.bot.print(3, `${cyan('Discord')} >> event "${yellow('COMMAND_EXECUTE')}" fired`);
        this.bot.print(3, `${cyan(`DShard #${msg.channel.guild ? msg.channel.guild.shard.id : 0}`)} >> Command '${cmd.extData.name}' executed by ${yellow(msg.author.id)}`);
      } catch (ex) {
        process.handleError(ex, cyan('Discord'), 'CommandError');
        msg.channel.createMessage({
          embed: {
            color      : this.bot.col['error'],
            description: this.localize(msg.author.locale['error'].join('\n'), { author: msg.author, err: ex })
          }
        });
      }
    }
  }

  checkArray(field, value, array) {
    if (array instanceof Array) {
      return array.some((v) => { return v[field] === value; });
    } else return false;
  }

  localize(msg, extData) {
    if (!msg) return '';

    if (extData.err)    msg = msg
      .replace(/\$\[err:code]/g, extData.err.code)
      .replace(/\$\[err:message]/g, extData.err.message.replace(/"/gi, '\\"'));
    if (extData.left)   msg = msg.replace(/\$\[cooldown:left]/g, extData.left);
    if (extData.author) msg = msg.replace(/\$\[author:mention]/g, extData.author.mention);

    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('cooldown'));
  }
};