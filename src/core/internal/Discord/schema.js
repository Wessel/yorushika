const { Schema, model } = require('mongoose');

const { safeLoad }     = require('js-yaml');
const { readFileSync } = require('fs');

const conf = safeLoad(readFileSync('application.yml', { encoding: 'utf8' }));

const guild = new Schema({
  guildId: { type: String, default: undefined },
  prefix : { type: String, default: conf.discord.prefix },
  locale : { type: String, default: conf.discord.locale }
});

const user = new Schema({
  userId: { type: String, default: undefined },
  prefix: { type: String, default: conf.discord.prefix },
  locale: { type: String, default: conf.discord.locale }
});

const tag = new Schema({
  name    : { type: String, default: undefined },
  uses    : { type: Number, default: 0 },
  content : { type: String, default: undefined },
  creation: { type: String, default: undefined },

  history  : [],
  author   : {
    id     : { type: String, default: undefined },
    name   : { type: String, default: undefined },
    guild  : { type: String, default: undefined },
    discrim: { type: String, default: undefined }
  }
});

module.exports = {
  tag  : model('dTags', tag, 'dTags'),
  user : model('dUsers', user, 'dUsers'),
  guild: model('dGuilds', guild, 'dGuilds')
};