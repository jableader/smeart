// Im just testing git commit commands
// Reminder -> Will need node pi-blaster libraries
// Reminder -> Will need node SensorTag Libraries
// Reminder -> Will need  ......

//////////////////////////////////////////////////////
// Calling required libraries
var SensorTag = require('sensortag');	    // Calling SensorTag Libraries
var piblaster = require('pi-blaster.js');   // Calling pi-blaster libraries

//////////////////////////////////////////////////////
// Setting Pin I/O
// Should be called in blinds and light -> piblaster.setPwm(17, 0);    //setPWM(Pin Numbber, Pwm Value bewtween 0 & 1)
//////////////

//////////////////////////////////////////////////////
// Global Variables

var SENSOR_TAG_PREVIOS_TEMP_VAL = "0";    // Giving an initial temp reference when booting up, alternatively creates a counter which counts to one before compring another value
var SENSOR_TAG_STORE_COUNT      = "0";

var SensorTagReader = function(sensorTagId) {
	this.sensorTagId = sensorTagReader;
}


sensorTagReader.prototype.onChange = function(callback, threshold) {
	//When this sensortag's temp changes by more than 'threshold', 
	//	callback(currentTemp);
    
    if (SENSOR_TAG_STORE_COUNT == "0")    // If true, just store initial temp value and do nothing else
    {
    	SENSOR_TAG_PREVIOS_TEMP_VAL = callback;
    	SENSOR_TAG_STORE_COUNT++;  
    }
    else
    {
    	// I assume callback is curent temp value
        
        if (SENSOR_TAG_PREVIOS_TEMP_VAL < callback)
        {  
            //  Upward slope
    		if ((callback - SENSOR_TAG_PREVIOS_TEMP_VAL) >= threshold)
    			??????callback(currentTemp)????????
        }
    	else
    	{     
    	    // Downward slope
    	    if ((SENSOR_TAG_PREVIOS_TEMP_VAL - callback) >= threshold)
    	    	????????????????????????????????????????????????
    	    ??????????????????????????????????????
    	}
    		
    }
    
}

sensorTagReader.prototype.getTemp = function() {
	//return the current temperature

	// Am I to assume that I 
	// First we have to locate Sensor tag (Just copy tutorials)

	// Enable the 
	return temperature???????????????????????????????????
}

var blinds = {}
blinds.getState = function() {
	// return "open" or "closed"

}


blinds.setState = function(state, onFinished) {
	if (state == "open") 
	{
		//open the blinds
		//call onFinished
		while (state != onFinished)     // Keep turning servo // < check if syntax is correct
		{  
			piblaster.setPwm(17, 1);    // setPWM(Arbitrary Input Pin Numbber, Pwm Value bewtween 0 & 1)
            if (/* Need to figure out a way to determnine if the servos is completly opening blinds*/)
            {
            	return onFinished;	    // Fully opened blinds, therefore signal
            }
        }

	} 
	else if (state == "closed") 
	{
		//close the blinds
		//call onFinished

		// TO DAVE. MAYBE WE USE ANOTHER PIN AND THIS PIN WILL CONNECT TO MOTOR BRIDGE NEGATIVE TERMINAL, THAT WAY IT COULD REVERSE OPENING?

		while (state != onFinished)
		{
			piblaster.setPwm(18, 1);    // setPWM(Arbitrary Input Pin Numbber, Pwm Value bewtween 0 & 1)
			if (/* Need to figure out a way to determnine if the servos is completly closing blinds*/)
            {
            	return onFinished;	    // Fully opened blinds, therefore signal
            }
		}
	} 
	else 
	{
		throw "Invalid state: '" + state + "'";
	}
}

module.exports = exports = {};    // Not sure about this atm
exports.getBlinds = function() { return blinds; };
exports.getInternalTempSensor = function() { return new SensorTagReader("ID OF INSIDE TAG"); };
exports.getExternalTempSensor = function() { return new SensorTagReader("ID OF OUTSIDE TAG"); };
