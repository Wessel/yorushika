const { readdirSync }              = require('fs');
const { red, green, yellow, cyan } = require('../../../util/colors');

module.exports = class EventStore {
  constructor(bot) {    
    this.bot = bot;
  }

  execute(event) {    
    const execAsync = async(...args) => {
      try { await event.emit(...args); }
      catch (ex) { process.handleError(ex, 'EventError', cyan('Discord')); }
    };

    this.bot.on(event.extData.name, execAsync);
  }

  async run(directory) {
    const startTimestamp = Date.now();
    
    const events = await readdirSync(directory);
    
    this.bot.print(1, `${cyan('Discord')} >> Loading ${green(events.length)} events...`);
    events.forEach((e) => {
      if (!e.endsWith('.js' )) return;
      const event = new(require(`${directory}/${e}`))(this.bot);

      if (!this.bot.conf.discord.events.includes(event.extData.name)) return false;
      if (this.bot.events.has(event.extData.name)) return this.bot.print(1, `[${cyan('Discord')}] -- Duplicate event found - ${red(`${directory}/${event.extData.name}`)}`);

      this.bot.events.set(event.extData.name, event);
      this.bot.print(2, `${cyan('Discord')} ++ Loaded event ${green(event.extData.name)} in ${yellow(`${(Date.now() - startTimestamp)}ms`)}`);

      this.execute(event);
    });

    this.bot.print(2, `${cyan('Discord')} >> Successfully loaded ${green(this.bot.events.size)} events`);
    return { success: true, directory: directory, events: this.bot.events };
  }
};