// Main
const Webhook          = require('./DiscordWebhook');
const RESTclient       = require('../internal/Discord/rest');
const { Client: Eris } = require('eris');
// Registries
const EventRegistry     = require('../registry/Discord/Events');
const LocaleRegistry    = require('../registry/Discord/Locales');
const CommandRegistry   = require('../registry/Discord/Commands');
// Utilities
const Util           = require('../../util/Util');
const Schema         = require('../internal/Discord/Schemas');
const { cyan }       = require('../../util/colors');
const Collection     = require('../../util/Collection');
const PermissionUtil = require('../internal/Discord/Utils/PermissionUtil');

module.exports = class WumpDiscord extends Eris {
  constructor(token, options = {}) {
    if (!token) throw new Error('Invalid token');
    if (!options.db) throw new Error('Invalid database');

    super(token, options.clientOptions);
    this.hook = options.webhook ? new Webhook({ token: options.webhook.token, channel: options.webhook.channel }) : new Webhook();

    this.cmds      = new Collection();
    this.cache     = new Collection();
    this.events    = new Collection();
    this.locales   = new Collection();
    this.localeMap = [];
    this.localeDic = [];

    this.m               = options.db;
    this.REST            = new RESTclient(this);
    this.eventRegistry   = new EventRegistry(this);
    this.localeRegistry  = new LocaleRegistry(this);
    this.commandRegistry = new CommandRegistry(this);

    this.util       = Util;
    this.print      = Util.print;
    this.schema     = Schema;
    this.Collection = Collection;

    this.ua   = options.ua     ? options.ua     : undefined;
    this.pkg  = options.pkg    ? options.pkg    : undefined;
    this.col  = options.colors ? options.colors : undefined;
    this.ico  = options.emojis ? options.emojis : undefined;
    this.conf = options.config ? options.config : undefined;

    this.requestHandler.userAgent = this.ua ? this.ua : `Wump (https://github.com/PassTheWessel/wump, ${this.pkg.version})`;
  }

  async launch(events, commands, locales) {
    this.eventRegistry.run(events);
    this.localeRegistry.run(locales);
    this.commandRegistry.run(commands);

    this.connect()
      .then(() => this.print(1, `${cyan('Discord')} >> Connecting shards to websockets...`));
  }

  op(id) { return this.conf['discord']['op'].includes(id); }

  emote(a, b, c) {
    if (!a || !this.ico[a]) return '';
    if (c) {
      if (!this.ico[a][b]) return '';
      if (!this.ico[a][b][c]) return '';
      if (this.ico[a][b][c].length <= 0) return '';
      else return this.ico[a][b][c];
    } else if (b) {
      if (!this.ico[a][b]) return '';
      if (this.ico[a][b].length <= 0) return '';
      else return this.ico[a][b];
    } else {
      if (this.ico[a].length < 1) return '';
      else return this.ico[a];
    }
  }

  gatherInvite(permission) {
    permission = PermissionUtil.resolve(permission);
    return `https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=${permission}`;
  }

  destroy(code = 0) {
    let trace = { success: false, code: code };
    try {
      this.disconnect({ reconnect: false });
      trace.success = true;
    } catch ( err ) {
      trace = {
        err: {
          code    : err.code,
          stack   : err.stack,
          message : err.message
        }
      };
    }

    return trace;
  }
};