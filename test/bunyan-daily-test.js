var expect = require('chai').expect;
var bunyanDaily = require('../lib/bunyan-daily.js');
var del = require('del');
var moment = require('moment');
var fs = require('fs');

var logDir = 'tmp-logs';
describe('bunyan-daily', function () {
  before(function () {
    del.sync(logDir);
  });

  it('init', function (done) {
    bunyanDaily.init({
      daily: {
        dir: logDir
      },
    });

    var log = bunyanDaily.logger('test');
    log.info('daily');
    var count = 0;
    var t = setInterval(function() {
      log.debug(count++);
      if (count === 6) {
        bunyanDaily.clear();
        clearInterval(t);
        done();
      }
    }, 5000);
    expect(fs.existsSync(logDir + '/' + moment().format('YYYY-MM-DD') + '.log')).to.be.ok;
  });
});