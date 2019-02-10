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

module.exports = {
  user : model('dUsers', user, 'dUsers'),
  guild: model('dGuilds', guild, 'dGuilds')
};