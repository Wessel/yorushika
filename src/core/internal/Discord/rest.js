module.exports = class RESTclient {
  constructor(bot) {
    this.bot = bot;
  }

    getRole($, g) {
      if (/^\d+$/.test($) && g.roles.get($)) {
        return $;
      } else if (/<@%(\d+)>$/.test($)) {
        const m = $.match(/^<@&(\d+)>$/);
        const r = g.roles.get(m[1]);
        if (r) {
          return $;
        }
      } else {
        const r = g.roles.filter((v) => v.name.toLowerCase().includes($.toLowerCase()));
        if (r.length >= 1) {
          return r[0];
        }
      }

      return undefined;
  }

  getUser($) {
    if (/^\d+$/.test($) && this.bot.users.get($)) {
      return this.bot.users.get($);
    } else if (/^<@!?(\d+)>$/.test($)) {
      const u = this.bot.users.get($.match(/^<@!?(\d+)>$/)[1]);
      if (u) {
        return u;
      }
    } else if (/^(.+)#(\d{4})$/.test($)) {
      const m = $.match(/^(.+)#(\d{4})$/);
      const u = this.bot.users.filter((v) => v.username === m[1] && Number(v.discriminator) === Number(m[2]));
      if (u.length >= 1) {
        return u[0];
      }
    } else {
      const u = this.bot.users.filter((v) => v.username.toLowerCase().includes($.toLowerCase()));
      if (u.length >= 1) {
        return u[0];
      }
    }

    return undefined;
  }

  getGuild($) {
    if (/^\d+$/.test($) && this.bot.guilds.get($)) {
      return this.bot.guilds.get($);
    } else {
      const tmp = this.bot.guilds.filter((v) => v.name.toLowerCase().includes($.toLowerCase()));
      if (tmp.length >= 1) {
        return tmp[0];
      }
    }
    
    return undefined;
  }

  getChannel($, g) {
    let c;
    
    if (/^\d+$/.test($)) {
      if (g) {
        if (!g.channels.has($)) {
          return undefined;
        }

        return g.channels.get($);
      } else {
        c = c in this.bot.channelGuildMap && this.bot.guilds.get(this.bot.channelGuildMap[$]).channels.get($);
        if (c) {
          return c;
        }
      }
    } else if (/^<#(\d+)>$/.test(c)) {
      const m = $.match(/^<#(\d+)>$/);
      if ($) {
        if (!g.channels.has(m[1])) {
          return undefined;
        }

        return g.channels.get(m[1]);
      } else {
        c = m[1] in this.bot.channelGuildMap && this.bot.guilds.get(this.bot.channelGuildMap[m[1]]).channels.get($);
        if (c) {
          return c;
        }
      }
    } else if ($) {
      c = g.channels.filter((v) => v.name.toLowerCase().includes($.toLowerCase()));
      if (c.length >= 1) {
        return c[0];
      }
    }
    
    return undefined;
  }

  getMember($, g, n = false) {
    if (!$ || !g) {
      return undefined;
    }

    if (/^\d+$/.test($) && g.members.get($)) {
      return g.members.get($);
    } else if (/^<@!?(\d+)>$/.test($)) {
      const m = $.match(/^<@!?(\d+)>$/);
      const u = g.members.get(m[1]);
      if (u) {
        return u;
      }
    } else if (/^(.+)#(\d{4})$/.test($)) {
      const m = $.match(/^(.+)#(\d{4})$/);
      const u = g.members.filter((v) => v.user.username === m[1] && Number(v.user.discriminator) === Number(m[2]));
      if (u.length >= 1) {
        return u[0];
      }
    } else if (!n) {
      const u = g.members.filter((v) => v.user.username.toLowerCase().includes(v.toLowerCase()));
      if (u.length >= 1) {
        return u[0];
      }
    }
    
    return undefined;
  }
};