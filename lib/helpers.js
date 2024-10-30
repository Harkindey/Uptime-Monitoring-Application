/*
*   Jelpers for variosu task
*
*/
const crypto = require('crypto')
const config = require('./config')
const https = require('https')
const querystring = require('querystring')

const helpers = {}

helpers.hash = (password) => {
    if(typeof(password) === 'string' && password.length  > 0){
        return crypto.createHmac('SHA256', config.hashingSecret).update(password).digest('hex');
    } else {
        return false
    }
}

// parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj =JSON.parse(str)
        return obj;
    } catch (error) {
        return {};
    }
}

// Create a string of random alhpanumeric characters of a given length

helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
    if(strLength) {
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnoqprstuvwxyz0123456789';

        // Start the final string
        let str = '';

        for (let i = 0; i < strLength; i++) {
            // create randome characters of strlength
            let randomNumber = Math.floor(Math.random() * possibleCharacters.length)
            str+=possibleCharacters.charAt(randomNumber)
        }

        return str;
    } else {
        return false
    }
}

helpers.sendTwilioSms = function(phone,msg,callback){


  return callback(false)
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg){
  
      // Configure the request payload
      var payload = {
        'From' : config.twilio.fromPhone,
        'To' : '+234'+phone,
        'Body' : msg
      };
      var stringPayload = querystring.stringify(payload);
  
  
      // Configure the request details
      var requestDetails = {
        'protocol' : 'https:',
        'hostname' : 'api.twilio.com',
        'method' : 'POST',
        'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
        'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
        'headers' : {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
      };
  
      // Instantiate the request object
      var req = https.request(requestDetails,function(res){
          // Grab the status of the sent request
          var status =  res.statusCode;
          // Callback successfully if the request went through
          if(status == 200 || status == 201){
            callback(false);
          } else {
            callback('Status code returned was '+status);
          }
      });
  
      // Bind to the error event so it doesn't get thrown
      req.on('error',function(e){
        callback(e);
      });
  
      // Add the payload
      req.write(stringPayload);
  
      // End the request
      req.end();
  
    } else {
      callback('Given parameters were missing or invalid');
    }
  };

module.exports = helpers;