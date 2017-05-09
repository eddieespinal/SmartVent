/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.99cd5b31-7bef-4637-a901-fe10299dea2239"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";


/**
 * The AlexaSkill prototype and helper functions
 */

var http = require('https');
var AlexaSkill = require('./AlexaSkill');

/*
 *
 * Particle is a child of AlexaSkill.
 *
 */
var Particle = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Particle.prototype = Object.create(AlexaSkill.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Particle onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
};

Particle.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Particle onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Smart Vent App, you can ask me to open or close the vent, you can also ask me to open low, medium or high.";

    response.ask(speechOutput);
};

Particle.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Particle onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
};

Particle.prototype.intentHandlers = {
    // register custom intent handlers
    ParticleIntent: function (intent, session, response) {
  		var opencloseSlot = intent.slots.openclose;
  		var openclose = opencloseSlot ? intent.slots.openclose.value : "";

      var positionSlot = intent.slots.position;
  		var ventPosition = positionSlot ? intent.slots.position.value : "";

  		var postValue = "";

  		// Replace these with action device id and access token
  		var deviceid = "194002c000847353138382849";
  		var accessToken = "50ff10031199264ea035e5244fdb923d0c83a8p2";

  		var sparkHst = "api.particle.io";
      var sparkPath = "/v1/devices/" + deviceid + "/openClose";

  		console.log("Host = " + sparkHst);

  		// User is asking to open or close the vent
  		if(undefined !== openclose && openclose.length > 0){
        var responseText = "";

        if(openclose == "open"){
          postValue = "high";
          responseText = "Open";
        }
        else{
          postValue = "close";
          responseText = "Closed";
        }

        makeParticleRequest(sparkHst, sparkPath, postValue, accessToken, function(resp){
          var json = JSON.parse(resp);

          response.tellWithCard("Ok, Smart Vent was " + responseText, "Particle!");
          //response.ask("Continue?");
        });
  		} else if(undefined !== ventPosition && ventPosition.length > 0) {

          if(ventPosition == "low") {
            postValue = "low";
          } else if(ventPosition == "medium") {
            postValue = "medium";
          } else if(ventPosition == "high") {
            postValue = "high";
          }

          makeParticleRequest(sparkHst, sparkPath, postValue, accessToken, function(resp){
            var json = JSON.parse(resp);

            response.tellWithCard("Ok, Smart Vent was opened " + ventPosition, "Particle!");
            //response.ask("Continue?");
          });
      } else {
  			response.tell("Sorry, I could not understand what you said");
  		}
    },
    HelpIntent: function (intent, session, response) {
        response.ask("Welcome to the Smart Vent App, you can ask me to open or close the vent, you can also ask me to open low, medium or high.");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Particle skill.
    var particleSkill = new Particle();
    particleSkill.execute(event, context);
};

function makeParticleRequest(hname, urlPath, args, accessToken, callback){
	// Particle API parameters
	var options = {
		hostname: hname,
		port: 443,
		path: urlPath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': '*.*'
		}
	}

	var postData = "access_token=" + accessToken + "&" + "args=" + args;

	console.log("Post Data: " + postData);

	// Call Particle API
	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));

		var body = "";

		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);

			body += chunk;
		});

		res.on('end', function () {
            callback(body);
        });
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write(postData);
	req.end();
}
