/**
 * @name Wunp
 * @author Wessel "wesselgame" T < discord@go2it.eu >
 * @license GPL-3.0
 * @version 0.1.1
 * @description A multi-functional bot written in Node.js
 */

console.clear();

const mongoose          = require('mongoose');
const { DiscordClient } = require('./core');

const { print }                             = require('./util/Util');
const { safeLoad }                          = require('js-yaml');
const { globalize }                         = require('nabbit');
const { join: pJoin }                       = require('path');
const { readFileSync }                      = require('fs');
const { magenta, green, cyan, yellow, red } = require('./util/colors');

globalize();
let Discord, Database;

process.argv = require('larg')(process.argv.slice(2));
process.hash = String.string(8);

process.handleError = (err, name, type, exit = false, custom = false) => {
  if (!custom) print(0, `${type ? type : green('Master')} !! ${name ? name : err.name ? err.name : 'Error'} -\n${red(`${err.message && err.stack ? `${err.message}\n${err.stack}` : err}`)}`);
  else print(0, custom);
  
  if (exit) process.exit(process.type(exit) === 8 ? exit : 1);
};

print(3, `${magenta('Debug')} >> Loading configuration files...`);
const pkg  = require('../package.json');
const ico  = safeLoad(readFileSync( 'assets/config/emotes.yml'));
const col  = safeLoad(readFileSync( 'assets/config/colors.yml'));
const conf = safeLoad(readFileSync('application.yml'));
print(3, `${magenta('Debug')} >> Configuration files loaded`);

process.on('uncaughtException', process.handleError);
process.on('unhandledRejection', process.handleError);
process.on('SIGINT', () => {
  if (Database) {
    try {
      print(2, `${yellow('Database')} >> Closing connection from database...`);
      mongoose.connection.close();
    } catch (ex) {
      print(2, `${yellow('Database')} >> Failed to close connection from database - ${red(`${ex.message}\n${ex.stack}`)}`);
      process.exit(1);
    } finally { print(2, `${yellow('Database')} >> ${green('Connection from database closed')}`); }
  }

  if (Discord) {
    try {
      print(2, `${cyan('Discord')} >> Disconnecting websockets...`);
      Discord.destroy(0);
    } catch (ex) {
    print(2, `${cyan('Discord' )} >> Failed to disconnect websockets - ${red(`${ex.message}\n${ex.stack}`)}`);
    process.exit(1);
    } finally { print(2, `${cyan('Discord')} >> ${green('Connection from websockets closed')}`); }
  }
  process.exit(0);
});

(async() => {
  if (!conf['db']) process.handleError(undefined, undefined, undefined, 1, red('!! Failed to start: No database found !!'));
  print(2, `${yellow('Database' )} >> Connecting to database...`);
  Database = mongoose.connect(conf['db'], { useNewUrlParser: true });
  mongoose.connection.on('error', process.handleError);
  print(2, `${yellow('Database')} >> ${green('Connected to database')}` );
})();

if (conf['discord']['enabled']) {
  print(2, `${cyan('Discord')} >> Creating client...`);
  Discord = new DiscordClient(conf['discord']['token'], {
    webhook  :{
      token  : conf['discord']['webhook'] ? conf['discord']['webhook']['token'] : undefined,
      channel: conf['discord']['webhook'] ? conf['discord']['webhook']['channel'] : undefined
    },

    clientOptions  : {
      maxShards    : 'auto',
      getAllUsers  : false,
      autoreconnect: true
    },

    ua    : `${pkg.displayName}/${pkg.version}/${conf['nightly'] ? 'nightly' : 'distribution'} (https://github.com/PassTheWessel/wump)`,
    db    : mongoose,
    pkg   : pkg,
    colors: col,
    emojis: ico,
    config: conf
  });

  print(2, `${cyan('Discord')} >> Client created, launching client...`);
  Discord.launch(pJoin(__dirname, 'events', 'Discord'), pJoin(__dirname, 'commands', 'Discord'), pJoin(__dirname, 'assets', 'i18n'), pJoin(__dirname, 'schedulers', 'Discord'));
}