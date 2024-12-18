require('dotenv').config()

/*
*   Create and export configguration variables
*
*/

// Container for all the environments
const environments = {};

// Staging (defualt) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    hashingSecret: 'This is a secret',
    maxChecksPerUser: 5,
    'twilio' : {
        'accountSid' : process.env.ACCOUNTSID,
        'authToken' : process.env.AUTH_TOKEN,
        'fromPhone' : process.env.FROM_PHONE
    }
};

// Production environment
environments.production = {
    'httpPort': 5200,
    'httpsPort': 5201,
    'envName': 'production',
    hashingSecret: 'This is a Also secret',
    maxChecksPerUser: 5,
    'twilio' : {
        'accountSid' : '',
        'authToken' : '',
        'fromPhone' : ''
    }
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string'? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;