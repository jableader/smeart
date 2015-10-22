var sensortag = require('sensortag');	    // Calling SensorTag Libraries
var piblaster = require('pi-blaster.js');   // Calling pi-blaster libraries

var SensorTagReader = function(sensorTagId, name) {
	this.previousTemperature = null;
	this.currentTemperature = null;
	this.isReady = false;
	
	sensortag.discoverById(sensorTagId, function(sensorTag) {
		console.log("Connected to " + name);
		
		sensorTag.enableIrTemperature(function(err) {
			if (err) {
				console.log("Error connecting to " + name + ": " + err);
				return;
			}
			
			console.log("Connected " + name + " is ready and listening");
			
			this.isReady = true;
			setInterval(function() {
				sensorTag.readIrTemperature(function(error, otemp, atemp) {
					console.log(name + " is at " + otemp); 
					
					this.previousTemp = this.currentTemp;
					this.currentTemp = Math.round(otemp);
					
					if (this.changeCallback && (Math.abs(this.currentTemp - this.previousTemp) >= this.changeThreshold){
						this.changeCallback(this.currentTemperature);
					}
				});
			}, 1000);
		});
	});
}


sensorTagReader.prototype.onChange = function(callback, threshold) {
	this.changeCallback = callback;
	this.changeThreshold = threshold;
}

sensorTagReader.prototype.getTemp = function() {
	return this.currentTemp;
}

var pins = {
	led: 21,
	open: 22,
	close: 23
}

var pulsePin = function(pin, time) {
	console.log("Pulsing " + pin);
	piblaster.setPwm(pin, 1);
	setTimeout(function() {
		console.log("Fin pulsing " + pin);
		piblaster.setPwm(pin, 0);
	}, time);
}

var blinds = {}
blinds.getState = function() {
	return this.state;
}


blinds.setState = function(state) {
	if (state === "open") {
		pulsePin(pins.open, 100);
		this.state = "open";
	} 
	else if (state === "closed") {
		pulsePin(pins.close, 100);
		this.state = "closed";
	}
	else {
		throw "Invalid state: '" + state + "'";
	}
}

blinds.setState('open');

module.exports = exports = {};
exports.getBlinds = function() { return blinds; };
exports.getInternalTempSensor = function() { return new SensorTagReader("b0b448b9d906", "inside_tag"); };
exports.getExternalTempSensor = function() { return new SensorTagReader("b0b448bed202", "outside_tag"); };
