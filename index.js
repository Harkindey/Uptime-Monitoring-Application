/*
*   Primary file for the API
*
*/

// Dependecies
const server = require('./lib/server');
const workers = require('./lib/workers')

const app = {};

// Init Function
app.init = () => {
    // Start the server
    server.init();

    // Start the workers
    workers.init();
};

// Execute
app.init();

// export the app
module.exports = app;