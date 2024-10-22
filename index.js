/*
*   Primary file for the API
*
*/

// Dependecies
const http = require('http');
const url = require('url');

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

    //Send the response
    res.end('Hellow World\n');

    //Log the request path 
    console.log('Request received with this headers: ', headers);
    
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
    console.log("The Server is listening on port 3000");
});