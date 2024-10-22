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

    //Send the response
    res.end('Hellow World\n');
    
    //Log the request path 
    console.log('Request received on path: '+trimmedPath);
    
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
    console.log("The Server is listening on port 3000");
});