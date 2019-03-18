const { safeLoad }                  = require('js-yaml');
const { cyan, red }                 = require('../../../util/colors');
const { readdirSync, readFileSync } = require('fs');

module.exports = class LocaleRegistry {
  constructor(bot) {
    this.bot = bot;
  }

  async run(directory) {
    const locales = await readdirSync(directory);

    for (let i = 0; i < locales.length; i++) {
      const files = await readdirSync(`${directory}/${locales[i]}`);
      files.forEach((f) => {
        try {
          if (f.endsWith('.yml') || f.endsWith('.yaml') ) {
            const l = safeLoad(readFileSync(`${directory}/${locales[i]}/${f}`));

            if (f.startsWith('strings')) {
              this.bot.locales.set(l['translation']['code'].toLowerCase(), l);
              this.bot.localeDic.push(l['translation']['code']);
              this.bot.localeMap.push(`${l['translation']['flag']} \`${l['translation']['code']}\` **:** ${l['translation']['orig']} (*${l['translation']['full']}*) \`[${l['translation']['progress']}%]\` {***${l['translation']['translator']['discord'][0]['name']}#${l['translation']['translator']['discord'][0]['discrim']}***}`);
            } else if (f.startsWith('logs')) {
              this.bot.locales.set(`${l['translation_code'].toLowerCase()}:LOGS`, l);
            } else if (f.startsWith('badwords')) {
              if (!this.bot.locales.has('badwords')) {
                this.bot.locales.set('badwords', l);
              } else {
                l.forEach((v) => {
                  this.bot.locales.get('badwords').push(v);
                });
              }

            }
          }
        } catch (ex) {
          process.handleError(ex, 'LoadError', cyan('Discord'));
          return { success: false, err: ex };
        }

        return { success: true, dictionary: this.bot.localeDic, map: this.bot.localeMap };
      });
    }
  }
};