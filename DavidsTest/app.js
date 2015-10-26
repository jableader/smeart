/**
 * Description:
 * This script is the Node.js server for WSNdemo.  It creates a server and ...
 */


/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
	, app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io')(server) // new
  , events = require('events')
  , EventEmitter = require('events').EventEmitter
  , path = require('path')
  , getTimeStampLog = require('./control/api/utilities') 
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , errorhandler = require('errorhandler')
  , cookieParser = require('cookie-parser')
  , ip = require('ip')
  , bodyParser = require('body-parser');

var SensorTag = require('sensortag');		// sensortag library

var sys = require('sys');
var exec = require('child_process').exec;
var child;

// all environments
app.set('port', process.env.PORT || 3000);
// Using the .html extension instead of
// having to name the views as *.ejs
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'control')));
app.use(express.static(path.join(__dirname, 'home')));
app.use('/pdf', express.static(__dirname + '/home/assets/pdf'));

// uncomment after placing your favicon in /public
app.use(favicon('favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));



/**
 * routes
 */

app.get('/', function(req, res) { 
   res.sendFile(__dirname + '/home/IoT2015template.html', { title: 'IoT2015 template' }); 
});

//app.get('/', function(req, res) { 
//    res.sendFile(__dirname + '/home/index.html', { title: 'IoT2015 template' }); 
//});


app.get('/control', function(req, res){
  res.render(__dirname+'/control/index.ejs', { title: 'IoT Demo' });  
});

app.get('/pdf', function(req, res){
  res.sendFile(__dirname+'/home/assets/pdf', { title: 'My Report' });   
});


// test for OS
var myOS = process.platform;
console.log('This platform is ' + myOS);
// end of test for OS

// on Linux only executes `hciconfig hci0 up`

if(myOS=='linux')
{
child = exec("hciconfig hci0 up", function (error, stdout, stderr) {
	console.log('hciconfig hci0 up');
  sys.print('stdout: ' + stdout)
  if (error !== null) {
    console.log('exec error: ' + error);
  }else
	console.log('OK');

});
};

// some delay here to start the server listen after serial port open
//var serverIP = 'localhost';
var serverIP = ip.address() ;
setTimeout(function(){ 
  server.listen(app.get('port'), serverIP, function(){ 
  console.log('Express server listening on: ', serverIP, ':', app.get('port'));
});
}, 2000);


// read the file "myconfig.json"
var fs = require('fs');
var file = __dirname + '/control/config/myconfig.json';
var text = fs.readFileSync(file, 'utf8') 
//console.log(text);
text = JSON.parse(text);
// end of read the file "myconfig.json"

// update myconfig.json with serverOS if needed
var savedOS = text.serverOS;
console.log("savedOS is: ", savedOS);//serverOS
console.log("serverOS is: ", myOS);
if(myOS !== savedOS){
 console.log("updating serverOS info to: ", myOS);
 text.serverOS = myOS; 
}
fs.writeFileSync(file, JSON.stringify(text, null, 4));


var user_count = 0;
//var timerID = "";

// socket.io handlers, we are here if socket is on
// new version 
  io.on('connection', function(socket){
  user_count++;
  socket.emit('users', { number: user_count });
  socket.broadcast.emit('users', { number: user_count });
  console.log("user_count: ", user_count);
  console.log("socket is connected");

  socket.on('disconnect', function () {
    user_count--;
    socket.broadcast.emit('users', { number: user_count });
    console.log(user_count);
  });

   // Send time every 2 seconds
  setInterval(function() {
    var now = new Date();
    socket.emit('timer_tick', { string: getTimeStampLog()});
    }, 1000);

///////////////////////////////////////////////////////////
  // sensortag part
/*
	sensorTag IR Temperature sensor example

	This example uses Sandeep Mistry's sensortag library for node.js to
	read data from a TI sensorTag.

	Although the sensortag library functions are all asynchronous,
	there is a sequence you need to follow in order to successfully
	read a tag:
		1) discover the tag
		2) connect to and set up the tag
		3) turn on the sensor you want to use (in this case, IR temp)
		4) turn on notifications for the sensor
		5) listen for changes from the sensortag

	This example does all of those steps in sequence by having each function
	call the next as a callback. Discover calls connectAndSetUp and so forth.

	This example is heavily indebted to Sandeep's test for the library, but
	achieves more or less the same thing without using the async library.

	created 15 Jan 2015
	modified 7 April 2015
	by Tom Igoe
*/


//var SensorTag = require('sensortag');		// sensortag library

// listen for tags:

SensorTag.discoverByUuid('b0b448b9d906', function(tag) {
//SensorTag.discover(function(tag) {
	console.log('connected!');
	console.log('discovered: ' + tag.uuid + ', type = ' + tag.type);
  	socket.emit('discover', { 'message': 'connected' });
	// when you disconnect from a tag, exit the program:
	tag.on('disconnect', function() {
		console.log('disconnected!');
  		socket.emit('discover', { 'message': 'disconnected' });
		//process.exit(0);
	});

	function connectAndSetUpMe() {			// attempt to connect to the tag
     console.log('connectAndSetUp');
     tag.connectAndSetUp(enableIrTempMe);		// when you connect, call enableIrTempMe
   }

   function enableIrTempMe() {		// attempt to enable the IR Temperature sensor
     console.log('enableIRTemperatureSensor');
     // when you enable the IR Temperature sensor, start notifications:
     tag.enableIrTemperature(notifyMe);
   }

	function notifyMe() {
   	tag.notifyIrTemperature(listenForTempReading);   	// start the accelerometer listener
		tag.notifySimpleKey(listenForButton);		// start the button listener
   }

   // When you get an accelermeter change, print it out:
	function listenForTempReading() {
		tag.on('irTemperatureChange', function(objectTemp, ambientTemp) {
	     console.log('\tObject Temp = %d deg. C', objectTemp.toFixed(1));
	     console.log('\tAmbient Temp = %d deg. C', ambientTemp.toFixed(1));
  	socket.emit('ObjectTemp', { 'message': objectTemp.toFixed(1) });
  	socket.emit('AmbientTemp', { 'message': ambientTemp.toFixed(1) });
	   });
	}

	// when you get a button change, print it out:
	function listenForButton() {
		tag.on('simpleKeyChange', function(left, right) {
			if (left) {
				console.log('left: ' + left);
			}
			if (right) {
				console.log('right: ' + right);
			}
			// if both buttons are pressed, disconnect:
			if (left && right) {
				tag.disconnect();
			}
	   });
	}

	// Now that you've defined all the functions, start the process:
	connectAndSetUpMe();
});





  // end sensortag part


////////////////////////////////////////////////////////////

  });


// end of socket.io handlers, we are here if socket is on  
//SensorTag.discoverByUuid('68c90b06f50b',function(sensorTag) { 
//console.log('discovered: ' + sensorTag); 
//sensorTag.on('disconnect', function() { 
//console.log('disconnected!'); 
//process.exit(0); 
//});
//}); 






