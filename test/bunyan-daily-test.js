var expect = require('chai').expect;
var bunyanDaily = require('../lib/bunyan-daily.js');
var del = require('del');
var moment = require('moment');
var fs = require('fs');

describe('bunyan-daily', function () {
  before(function () {
    del.sync('logs');
  });

  it('init', function () {
    bunyanDaily.init({
      daily: {
        dir: 'tmp-logs'
      },
      logstash: {
        host: 'svr.zeusky.com',
        port: 5000,
        index: 'bunyan-daily-test'
      }
    });

    var log = bunyanDaily.logger('test');
    log.info('daily');
    var count = 0;
    var t = setInterval(function() {
      log.debug(count++);
      if (count === 6) {
        bunyanDaily.clear();
        clearInterval(t);
      }
      expect(fs.existsSync('logs/' + moment().format('YYYY-MM-DD') + '.log')).to.be.ok;
    }, 10000);
  });
});