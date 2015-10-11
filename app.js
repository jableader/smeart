var CLOSE_BLINDS_THRESHOLD = 25;
var OPEN_BLINDS_THRESHOLD = 15;
var ONE_MINUTE = 60*1000
var DEFAULT_BLOCK_TIME = 5*ONE_MINUTE;

var hardware = require('./hardware.js');
var app = require('express');

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

  return function(state, force, blockTime) {
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

var recentlyChangedBlinds = function() {
  hasRecentlyChangedBlinds = true;
  setTimeout(function() { hasRecentlyChangedBlinds = false; }, 5*ONE_MINUTE);
}

indoorSensor.onChange(1, function(temp) {
  var blindsState = blinds.getState()
  if (temp > CLOSE_BLINDS_THRESHOLD && blindsState === 'open') {
    blinds.setState('closed');
  }
  else if (temp < CLOSE_BLINDS_THRESHOLD && blindsState === 'closed') {
    blinds.setState('open');
  }
})
