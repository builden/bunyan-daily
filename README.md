# bunyan-daily
based bunyan

## How to use
```js
var bunyanDaliy = require('bunyan-daily');
bunyanDaily.init();

var log = bunyanDaily.logger('module-name');
log.debug('debug msg');
log.info('info msg');
log.warn('warn msg');
log.error('error msg');
```

## Installation
```sh
npm install --save bunyan-daily
```

## Tests
```sh
npm install
npm test
```