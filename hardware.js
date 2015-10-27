var sensortag = require('sensortag');	    // Calling SensorTag Libraries
var piblaster = require('pi-blaster.js');   // Calling pi-blaster libraries

var rng = function(period){
	var base = 21;
	var variation = 10;
	var jitter = 1;
	
	var t = 0;
	return function(){
		return base*Math.sin(2*Math.pi*(++t % period)/period) + Math.random()*(2*jitter)-jitter;
	}
}

var SensorTagReader = function(sensorTagId, name) {
	var _this = this;
	
	this.name = name;
	this.previousTemp = null;
	this.currentTemp = null;
	this.isReady = false;
	
	console.log("Looking for " + name + " as " + sensorTagId);
	
	this.startReadSensorLoop(null);
}


SensorTagReader.prototype.startReadSensorLoop = function(tag) {
	console.log("Sensor " + this.name + " is ready and listening");
	var _this = this
	this.isReady = true;
	
	var irfunction = function(error, otemp, atemp) {
		this.previousTemp = this.currentTemp;
		this.currentTemp = Math.round(otemp);
		
		if (this.changeCallback && (Math.abs(this.currentTemp - this.previousTemp) >= this.changeThreshold)){
			this.changeCallback(this.currentTemp);
		}
	}
	
	var _this = this;
	var r = rng(20+Math.random()*40);
	setInterval(function() {
		var t = r();
		irfunction.call(this, null, t, t);
	}, 1000);
}

SensorTagReader.prototype.onChange = function(callback, threshold) {
	this.changeCallback = callback;
	this.changeThreshold = threshold;
}

SensorTagReader.prototype.getTemp = function() {
	return this.currentTemp;
}

var pins = {
	close: 17, // P-11
	open: 27, // P-13
	led: 22 // P-15
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
		piblaster.setPwm(pins.led, 0);
		pulsePin(pins.open, 100);
		this.state = "open";
	} 
	else if (state === "closed") {
		piblaster.setPwm(pins.led, 1);
		pulsePin(pins.close, 100);
		this.state = "closed";
	}
	else {
		throw "Invalid state: '" + state + "'";
	}
}

setTimeout(function() { blinds.setState('closed'); }, 500);

module.exports = exports = {};
exports.getBlinds = function() { return blinds; };
exports.getInternalTempSensor = function() { return new SensorTagReader("b0b448b9d906", "inside_tag"); };
exports.getExternalTempSensor = function() { return new SensorTagReader("b0b448bed202", "outside_tag"); };
