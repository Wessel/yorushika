const { Constants } = require('eris');

module.exports = class PermissionUtil {
  static resolve(permission) {
    if (typeof permission === 'number' && permission >= 0) return permission;
    if (typeof permission === 'string') return Constants.permission[permission];
    if (permission instanceof Array) return permission.map((v) => this.resolve(v)).reduce((prev, p) => prev | p, 0);
    throw new RangeError('Invalid permission');
  }
};