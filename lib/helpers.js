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

module.exports = helpers;