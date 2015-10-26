var CLOSE_BLINDS_THRESHOLD = 25;
var OPEN_BLINDS_THRESHOLD = 15;
var ONE_MINUTE = 60*1000
var DEFAULT_BLOCK_TIME = 5*ONE_MINUTE;

var hardware = require('./hardware.js');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use('/static', express.static('static'))

var indoorSensor = hardware.getInternalTempSensor();
var outdoorSensor = hardware.getExternalTempSensor();
var blinds = hardware.getBlinds();

var setState = (function() {
	var blockUntil = null;

	var setBlockTimeout = function(timeout) {
		blockUntil = timeout ? (Date.now() + timeout) : null;
	}
	
	var isBlocked = function() {
		return false; //return blockUntil !== null && (Date.now() < blockUntil);
	}

	return function(state, blockTime, force) {
		if (force || !isBlocked()) {
			setBlockTimeout(blockTime);
			blinds.setState(state);
		} else {
			console.log("Got blocked!");	
		}
	}
})();


indoorSensor.onChange(function(temp) {
	var blindsState = blinds.getState();

	//console.log("Inside got called with temp " + temp);
	//console.log("Outside is at " + outdoorSensor.getTemp());
	//console.log("Blinds are currently " + blindsState);
	
	if (temp > CLOSE_BLINDS_THRESHOLD && blindsState === 'open' && outdoorSensor.getTemp() > temp) {
		console.log("Closing blinds");
		setState('closed', DEFAULT_BLOCK_TIME);
	}
	else if (temp < CLOSE_BLINDS_THRESHOLD && blindsState === 'closed' && outdoorSensor.getTemp() < temp) {
		console.log("Opening blinds");
		setState('open', DEFAULT_BLOCK_TIME);
	}
}, 1);

app.route('/state')
	.get(function(req, res) {
		//console.log("Recieved state GET");
		
		res.json({
			state: blinds.getState(),
			indoorTemp: indoorSensor.getTemp(),
			outdoorTemp: outdoorSensor.getTemp()
		});
	})
	.post(function(req, res) {
		console.log("Recieved state POST");
		
		var state = req.body.state;
		var timeout = req.body.timeout ? req.body.timeout : DEFAULT_BLOCK_TIME;
		
		console.log("Setting state to " + state)

		if (state == 'closed' || state == 'open') {
			setState(state, timeout, true);
			res.json({});
		} else {
			res.status(400).json({
				state: "Please set the parameter 'state' to be either \"open\" or \"closed\""
			});
		}
	});

app.route('/')
	.get(function(req, res) {
		fs.readFile('static/page.html', 'utf8', function(err, data){
			if (err) {
				console.log("Could not load page.html");
				
				res.status(404).send('Not found');
				return;
			}
			
			res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
			res.end(data, 'utf8');
		});
	});
	
app.listen(80, function() {
	console.log("Listening");
});
