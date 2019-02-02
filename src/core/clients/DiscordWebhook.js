const fetch           = require('wumpfetch');
const { randomBytes } = require('crypto');

module.exports = class DiscordWebhook {
  constructor(extData = {}) {

    this.hash    = randomBytes(Math.floor(Math.random() * 10) + 5).toString('hex');
    this.baseURL = 'https://discordapp.com/api/webhooks';
    this.extData = extData;

    (async() => {
      try {
        if (!this.extData.token || !this.extData.channel) return this.hook = undefined;
        this.hook = await fetch(`${this.baseURL}/${this.extData.channel}/${this.extData.token}`, { method: 'GET' }).send();
        if (this.hook.statusCode !== 200) throw new SyntaxError( 'Failed to fetch webhook' );
      } catch (ex) { throw ex; }
    })();
  }

  async send(data = {}) {
    if (!this.hook) return true;
    return await fetch(`${this.baseURL}/${this.extData.channel}/${this.extData.token}`, { method: 'POST', data: data }).send();
  }
};