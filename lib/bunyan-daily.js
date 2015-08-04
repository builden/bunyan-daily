var fs = require('fs-extra');
var path = require('path');
var bunyan = require('bunyan');
var later = require('later');
var moment = require('moment');
var bunyantcp = require('bunyan-logstash-tcp');

later.date.localTime();
var streams = [];
var loggers = [];
var dailyOpts = null;
var t = null;
var tcpStream = null;

/**
 * options:
 *  console  是否输出到console中
 *    level [debug]
 *  daily   文件名为'YYYY-MM-DD.log'
 *    level [debug]
 *    dir  日志生成的路径 [logs]
 *  logstash
 *    level [debug]
 *    host
 *    port
 *    index 索引
 */
exports.init = function init(options) {
  dailyOpts = options.daily = options.daily || { dir: 'logs' };
  var dailyStream = {
    level: options.daily.level || 'debug',
    type: 'file',
    path: getLogFile(options.daily.dir)
  };
  streams.push(dailyStream);
  fs.mkdirsSync(options.daily.dir);

  options.console = options.console || { level: 'debug', type: 'stream', stream: process.stdout };
  streams.push(options.console);

  if (options.logstash) {
    tcpStream = bunyantcp.createStream({
      host: options.logstash.host,
      port: options.logstash.port,
      tags: [options.logstash.index]
    });
    var lsStream = {
      level: options.logstash.level || 'debug',
      type: 'raw',
      stream: tcpStream
    };
    streams.push(lsStream);
  }

  scheduleRotate();
};

exports.logger = function logger(name) {
  var l = bunyan.createLogger({
    name: name,
    streams: streams
  });
  loggers.push(l);
  return l;
};

function getLogFile(dir) {
  return path.join(dir, moment().format('YYYY-MM-DD') + '.log');
}

function scheduleRotate() {
  // 每天00:00
  var sched = {
    schedules: [{
      h: [0]
    }]
  };

  t = later.setInterval(function () {
    console.log('bunyan-daily later interval: ' + moment().format('YYYY-MM-DD HH.mm.ss'));
    changeLoggerFileName();
  }, sched);
}

function changeLoggerFileName() {
  loggers.forEach(function (logger) {
    logger.streams[0].path = getLogFile(dailyOpts.dir);

    logger.reopenFileStreams();
  });
}

exports.clear = function clear() {
  t && t.clear();
  tcpStream && tcpStream.socket.end();
};