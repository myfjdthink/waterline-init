# waterline-initializer
initialize waterline without sails

usage:
```
var BuildWaterLine = require('waterline-init');
BuildWaterLine.buildORM('testMongodb', {migrate: 'drop'}, function (err, models) {
    if (err) throw err;
    console.log('waterline init time %s s', (Date.now() - start_time) / 1000);
    done()
})
```