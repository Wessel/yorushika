const w               = require('wumpfetch');
const { randomBytes } = require('crypto');

module.exports = class DiscordWebhook {
  constructor(extData = {}) {

    this.hash    = randomBytes(Math.floor(Math.random() * 10) + 5).toString('hex');
    this.baseURL = 'https://discordapp.com/api/webhooks';
    this.extData = extData;

    (async() => {
      try {
        if (!this.extData.token || !this.extData.channel) return this.hook = undefined;
        this.payloadURL = `${this.baseURL}/${this.extData.channel}/${this.extData.token}`;
        this.hook       = await w(this.payloadURL).send();
        if (this.hook.statusCode !== 200) throw new SyntaxError( 'Failed to fetch webhook' );
      } catch (ex) { throw ex; }
    })();
  }

  async send(payload = {}) {
    if (!this.hook) return true;
    const req = await w(this.payloadURL, { method: 'POST', data: payload, sendDataAs: 'json' }).send();
    return req;
  }
};