const mongoose         = require('mongoose');
const { safeLoad }     = require('js-yaml');
const { readFileSync } = require('fs');

const conf = safeLoad(readFileSync('application.yml', { encoding: 'utf8' }));

const guild = new mongoose.Schema({
  guildId: { type: String, default: undefined },
  prefix : { type: String, default: conf['discord']['prefix']  },
  locale: { type: String, default: conf['discord']['locale'] }
});

const user = new mongoose.Schema({
  userId: { type: String, default: undefined },
  locale: { type: String, default: conf['discord']['locale'] }
});

module.exports = {
  user : mongoose.model('dUsers', user, 'dUsers'),
  guild: mongoose.model('dGuilds', guild, 'dGuilds')
};