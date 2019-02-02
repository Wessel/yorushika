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
            }
          }
        } catch (ex) {
          process.handleError(ex, cyan('Discord'), 'LoadError');
          return { success: false, err: ex };
        }

        return { success: true, dictionary: this.bot.localeDic, map: this.bot.localeMap };
      });
    }
  }
};