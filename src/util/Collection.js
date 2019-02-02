module.exports = class WumpCollection extends Map {
  constructor() { super(); }

  filter(callback) {
    const all  = Array.from(this.values());
    let result = [];
    for (let i = 0; i < all.length; i++) {
      if (callback(all[i])) result.push(all[i]);
    }

    return result;
  }

  map(callback) {
    let result   = [];
    const values = Array.from(this.values());
    for (let i = 0; i < values.length; i++) {
      result.push(callback(values[i]));
    }

    return result;
  }
};