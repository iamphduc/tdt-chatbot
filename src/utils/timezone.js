const timezone = require('moment-timezone');

const today = timezone().tz('Asia/Ho_Chi_Minh');

module.exports = Object.freeze({
  TODAY: today.format('DD/MM'),
  TOMORROW: today.add(1, 'day').format('DD/MM'),
});
