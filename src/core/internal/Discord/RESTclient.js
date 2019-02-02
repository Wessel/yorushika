module.exports = class RESTclient {
  constructor(bot) {
    this.bot = bot;
  }

  resolveGuild(q) {
    if (q) return undefined;

    const g = this.bot.guilds.get(q);
    if (/^\d+$/.test(q)) return g;
    else {
      const gs = this.bot.guilds.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()));
      if (gs.length > 1) return gs[0];
      else return undefined;
    } 
  }

  resolveUser(q) {
    if (!q) return undefined;
    
    if (/^\d+$/.test(q)) {
      const u = this.bot.users.get(q);
      if (u) return u;
    } else if (/^<@!?(\d+)>$/.test(q)) {
      const u = this.bot.users.get(q.match(/^<@!?(\d+)>$/)[1]);
      if (u) return u;
    } else if (/^(.+)#(\d{4})$/.test(q)) {
      const m = q.match(/^(.+)#(\d{4})$/);
      const u = this.bot.users.filter((v) => v.username === m[1] && Number(v.discriminator) === Number(m[2]));
      if (u.length >= 1) return u[0];
    } else {
      const u = this.bot.users.filter((v) => v.username.toLowerCase().includes(q.toLowerCase()));
      if (u.length >= 1) return u[0];
      else return undefined;
    }
  }
};