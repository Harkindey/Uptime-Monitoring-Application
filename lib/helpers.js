/*
*   Jelpers for variosu task
*
*/
const crypto = require('crypto')
const config = require('./config')

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

module.exports = helpers;