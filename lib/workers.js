/* 
*   Workers Related tasks
*
*/

// Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');

// instantiate the workers module object
const workers = {};

//Lookup all checks and get their data, send to a validator
workers.gatherAllChecks = () => {
    // Get all the checks
    _data.list('checks', (err, checks) => {
        if(!err && checks && checks.length > 0) {
            checks.forEach(check => {
                // Read in the check data
                _data.read('checks', check, (err, orginalCheckData) =>  {
                    if(!err && originalCheckData) {
                        // Pass it to the check validator, and let that function continue or log err
                        workers.validateCheckData(originalCheckData);
                    } else {
                        console.log("Error reading one of the check's data")
                    }
                });
            })
        } else {
            console.log('Error: Could not find any checks to process')
        }
    })
}
// Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
    originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) === 'string' && originalCheckData.id.trim().length === 20 ? originalCheckData.id.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) === 'string' && originalCheckData.id.trim().length === 11 ? originalCheckData.id.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) === 'string' && originalCheckData.id.trim().length > 0 ? originalCheckData.protocol : false;
    originalCheckData.method = typeof(originalCheckData.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) === 'string' && originalCheckData.successCodes instanceof Array  && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds: false;
}

// Timer to execute the worker-Process once per minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks()
    }, 1000 * 60)
}

// Init Script
workers.init = () => {
    // Execute all the checks immediately
    workers.gatherAllChecks()
    // Call the loop so the checks will execute later on
    workers.loop()
}

// Export module
module.exports = workers;