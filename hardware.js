// Im just testing git commit commands
var SensorTagReader = function(sensorTagId) {
	this.sensorTagId = sensorTagReader;
}

sensorTagReader.prototype.onChange = function(callback, threshold) {
	//When this sensortag's temp changes by more than 'threshold', 
	//	callback(currentTemp);
}

sensorTagReader.prototype.getTemp = function() {
	//return the current temperature
}

var blinds = {}
blinds.getState = function() {
	// return "open" or "closed"
}

blinds.setState = function(state, onFinished) {
	if (state === "open") {
		//open the blinds
		//call onFinished
	} else if (state == "closed") {
		//close the blinds
		//call onFinished
	} else {
		throw "Invalid state: '" + state + "'";
	}
}

module.exports = exports = {};
exports.getBlinds = function() { return blinds; };
exports.getInternalTempSensor = function() { return new SensorTagReader("ID OF INSIDE TAG"); };
exports.getExternalTempSensor = function() { return new SensorTagReader("ID OF OUTSIDE TAG"); };
