/*
*   Primary file for the API
*
*/

// Dependecies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// the server should respond to all requests with a string
const server = http.createServer(function(req, res){

    //Get the URL and parse it
    const parsedURL = url.parse(req.url, true);

    //Get the path
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    const queryStringObject = parsedURL.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload if any
    const decorder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decorder.write(data);
    })

    req.on('end', () => {
        buffer += decorder.end();

        // Choose the handler the request should go to. If one is not found use the notFound handler
        let choosenHandler = handlers.notFound;
        choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer,
        };

        // Route the request to the handler specified in the router
        choosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to  an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload)

            //Send the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log response
            console.log('Return response: ', statusCode, payloadString);
        });
    });
});

// Start the server,
server.listen(config.port, function(){
    console.log(`The Server is listening on port ${config.port} in ${config.envName} now`);
});

// Define the handlers
let handlers = {};

// Sample handler
handlers.sample = (data,callback) => {
    // Callback a http status code, and a payload object
    callback(406, {'name': 'sample handler'})
};

// Not Found handler
handlers.notFound = function (data, callback)  {
    callback(404)
};
// Define a request router
var router = {
    'sample': handlers.sample,
};