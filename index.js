/*
*   Primary file for the API
*
*/

// Dependecies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// We are instantiate the HTTP server
const httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);
})

// Start the server,
httpServer.listen(config.httpPort, function(){
    console.log(`The Server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
const httpsServerOption= {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
}
const httpsServer = https.createServer(httpsServerOption, function(req, res){
    unifiedServer(req, res)
})

//Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
    console.log(`The Server is listening on port ${config.httpsPort}`);
});

//  All the server logic for both the http and https server
const unifiedServer = (req,res) => {
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
            'payload': helpers.parseJsonToObject(buffer),
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
}

// Define a request router
var router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
};