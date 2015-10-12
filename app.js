var CLOSE_BLINDS_THRESHOLD = 25;
var OPEN_BLINDS_THRESHOLD = 15;
var ONE_MINUTE = 60*1000
var DEFAULT_BLOCK_TIME = 5*ONE_MINUTE;

var hardware = require('./hardware.js');
var app = require('express');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

var indoorSensor = hardware.getInternalTempSensor();
var outdoorSensor = hardware.getExternalTempSensor();
var blinds = hardware.getBlinds();

var setState = (function() {
  var blockChange = false;
  var blockTimeoutId = null;

  var setBlockTimeout = function(timeout) {
    if (blockTimeoutId !== null) {
      clearTimout(blockTimeoutId);
      blockTimeoutId = null;
    }

    if (timeout !== null) {
      blockTimeoutId = setTimeout(function() {
        blockChange = false;
        blockTimeoutId = null;
      }, timeout);
    }
  }

  return function(state, blockTime, force) {
      if (force || !blockChange) {
        if (blockTimeoutId !== null)
          setBlockTimeout(null);

        blockChange = true;
        blinds.setState(state, function() {
          setBlockTimeout(blockTime);
        });
      }
  }
})();


indoorSensor.onChange(1, function(temp) {
  var blindsState = blinds.getState();
  if (temp > CLOSE_BLINDS_THRESHOLD && blindsState === 'open' && outdoorSensor.getTemp() > temp) {
    setState('closed', DEFAULT_BLOCK_TIME);
  }
  else if (temp < CLOSE_BLINDS_THRESHOLD && blindsState === 'closed' && outdoorSensor.getTemp() < temp) {
    setState('open', DEFAULT_BLOCK_TIME);
  }
});

app.route('/state')
  .get(function(req, res) {
    res.json({
      state: blinds.getState(),
      indoorTemp: indoorSensor.getTemp(),
      outdoorTemp: outdoorSensor.getTemp()
    });
  })
  .post('/state', function(req, res) {
    var state = req.body.state;

    if (state == 'closed' || state == 'open') {
      setState(state, true, req.body.timeout);
      res.json({});
    } else {
      res.status(400).json({
        state: "Please set the parameter 'state' to be either \"open\" or \"closed\""
      });
    }
  });
