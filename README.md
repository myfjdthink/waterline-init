# waterline-initializer
initialize waterline without sails

usage:

`npm install --save waterline-init`

then

```
var BuildWaterLine = require('waterline-init');
BuildWaterLine.buildORM('testMongodb', {migrate: 'drop'}, function (err, models) {
    if (err) throw err;
    console.log('waterline init time %s s', (Date.now() - start_time) / 1000);
    models['User'].findOne({}, function(err, user){
        done()
    })
})
```
