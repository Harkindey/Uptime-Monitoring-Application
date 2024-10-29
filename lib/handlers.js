/*
*   Request Handlers
*
*/
//Dependencies
const _data = require('./data')
const helpers = require('./helpers')
const config = require('./config')

// Define the handlers
let handlers = {};

// Users
handlers.users = (data, callback) => {
    var acceptableMethods = ['post','get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    };
};

// Container for users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback)  => {
    // Check that all required fields are filled out
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 11 ? data.payload.phone : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement) {
        // Make sure user doesnt already exist
        _data.read('users', phone, (err, v) => {
            if(err){
                // Hash Password
                const hashedPassword = helpers.hash(password);
                if(hashPassword){
                    // Create the user object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement' : true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(400, {'Error' : "User could not be created"});
                        }
                    });
                } else {
                    callback();
                }     
            } else {
                // User already exists
                callback(400, {'Error': 'A user with that phone number already exists'});
            };
        })
    } else {
        callback(400, {Error: 'Missing required fields'});
    }
}

// Users - get
// Required Data: phone
// Optional data: none
handlers._users.get = (data, callback)  => {
    // Check that the phone is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 11 ? data.queryStringObject.phone : false;

    if(phone) {
        // Get the token form headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                //Lookup the user
                _data.read("users", phone, (err, data) => {
                    if(!err && data) {
                        // Remove Hashed Password from user object for return
                        delete data.hashPassword;
                        callback(200, data);
                    } else {
                        callback(404)
                    }
                })
            } else {
                callback(403, {'Error' : 'Missing required token in header, or token is invalid'})
            }
        })


    } else {
        callback(400, {'Error': 'Missing required field'});
    }

}
// Users - put
// Required Data: phone
// Optional data: firstName, LastName, password (at least one must be specified)
handlers._users.put = (data, callback)  => {
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.length === 11 ? data.payload.phone : false;
    
    // check for optional fields
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    // Error if the phone is invalid
    if(phone) {
        // Error if nothing is sent to update
        if(firstName || lastName || password) {
            // lookup the user
            // Get the token form headers
            const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read('users', phone, (err, userData) => {
                        if(!err && userData) {
                            // Update the fields necessary
                            if(firstName){
                                userData.firstName = firstName; 
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = helpers.hash(password);
                            }
        
                            // Store the new updates
                            _data.update('users', phone, userData, (err) => {
                                if(!err) {
                                    callback(200)
                                } else {
                                    console.log(err);
                                    callback(500, {'Error': 'Could not update the user'})
                                }
                            })
                        } else {
                            callback(400,{"Error": 'The specified user does not exist'} )
                        }
                    })
                } else {
                    callback(403, {'Error' : 'Missing required token in header, or token is invalid'})
                }
            });

        } else {
            callback(400, {'Error': 'Missing fields to update'})
        }
    } else {
        callback(400,{'Error': 'Missing required field'})
    }
}
// Users - delete
// Required Data: phone
// @TODO only let aunthenticated user delete their  own object. Don't let them delete anyone else
// @TODO Delete other data files associated with this users
handlers._users.delete = (data, callback)  => {
    // Check that the phone is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 11 ? data.queryStringObject.phone : false;
    if(phone) {
         // Get the token form headers
         const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

         handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                //Lookup the user
                _data.read("users", phone, (err, data) => {
                    if(!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {'Error' : "Could not delete the specified user"})
                            }
                        })
                    } else {
                        callback(404, {"Error": "Could not find specified users"})
                    }
                })
            } else {
                callback(403, {'Error' : 'Missing required token in header, or token is invalid'})
            }
         });

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
}

// Tokens
handlers.tokens = (data, callback) => {
    var acceptableMethods = ['post','get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    };
};

// Container for all the tokens methods
handlers._tokens = {};

//Tokens - Post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 11 ? data.payload.phone : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    if(phone && password) {
        // look up user who matches that phone number
        _data.read('users', phone, (err, userData) => {
            if(!err && userData) {
                // Hash the sent password and compare it to the password stored in the user object
                const hashPassword = helpers.hash(password);
                if(hashPassword === userData.hashedPassword) {
                    // If valid crate a new token with a random name, Set Expiration to 1 hour in thr future
                    const tokenID = helpers.createRandomString(20);

                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenID,
                        'expires': expires
                    }

                    // Stores the token
                    _data.create('tokens', tokenID, tokenObject, (err) => {
                        if(!err) {
                            callback(200, tokenObject);
                        }else {
                            callback(500, {'Error' : 'Could not create the new token'});
                        }
                    })
                } else {
                    callback(400, {'Error' : "Password did not match specified user's stored password"})
                }
            } else {
                callback(400, {"Error" : "Could not find the specified user"});
            }
        });
    } else {
        callback(400, {"Error":'Missing required field(s)'})
    }
};
//Tokens - Get
// Required Data:  id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Check that the id is valid
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id : false;

    if(id) {
        //Lookup the token
        _data.read("tokens", id, (err, tokenData) => {
            if(!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404)
            }
        })

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};
//Tokens - Put
// Required Fields: id, extend
//  Optional Data: none
handlers._tokens.put = (data, callback) => {
    const id = typeof(data.payload.id) === 'string' && data.payload.id.length === 20 ? data.payload.id : false;
    const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

    if(id && extend) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                // Check to make sure token isn't already expired
                if(tokenData.expires > Date.now()) {
                    // Set expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //Store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if(!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': "Could not update the tokens expiration"});
                        }
                    });
                } else {
                    callback(400, {"Error" : "Token has already expired, and cannot be extended"})
                }
            } else {
                callback(400, {"Error" : "Specified token does not exist"})
            }
        })

    } else {
        callback(400, {"Error" : "Missing required field(s) are invalid"})
    }
};
//Tokens - Delete
// Required data: id
//Optional : none
handlers._tokens.delete = (data, callback) =>  {
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id : false;
    if(id) {
        //Lookup the token
        _data.read("tokens", id, (err, data) => {
            if(!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error' : "Could not delete the specified token"})
                    }
                })
            } else {
                callback(404, {"Error": "Could not find specified token"})
            }
        })

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Verify if a given ID is currently valid for a givem user
handlers._tokens.verifyToken = (id, phone, callback) => {
    // LOOKup the token
    _data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if(tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false);
        }
    })
}

// Checks
handlers.checks = (data, callback) => {
    var acceptableMethods = ['post','get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    };
};

// Container for all the checks methods
handlers._checks = {};

//Checks - Post
// Required data: protocol, url, method, successCodes, timeoutSeconds
//Optional data: none
handlers._checks.post = (data, callback) => {
    //  validate inputs
    const protocol = typeof(data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 &&  data.payload.timeoutSeconds <=5 ? data.payload.timeoutSeconds : false;
console.log(protocol , url , method , successCodes , timeoutSeconds)
    if(protocol && url && data.payload.method && successCodes && timeoutSeconds) {
        // Get the tokem from headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        // lookup the user by reading token
        _data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData) {
                const userPhone = tokenData.phone;

                //Look up the user data
                _data.read('users', userPhone, (err, userData) => {
                    if(!err && userData) {
                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
                        // verify that the user has less than the number of max-checks-per-user
                        if(userChecks.length < config.maxChecksPerUser) {
                            // create randomId for the checks
                            const checkId = helpers.createRandomString(20);

                            // Create the check object, and include the user's phone
                             const checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes' : successCodes,
                                'timeoutSeconds': timeoutSeconds
                             };
                             // Save the object
                             _data.create('checks', checkId, checkObject, (err) => {
                                if(!err) {
                                    // Add the check id to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    //Save the ne user data
                                    _data.update('users',userPhone, userData, (err) => {
                                        if(!err) {
                                            callback(200, checkObject)
                                        } else {
                                            callback(500, {'Error': 'Could not update the user with the new check'});
                                        }
                                    })
                                } else {
                                    callback(500, {"Error": "Could not create the new check"});
                                }
                             })
                        } else {
                            callback(400, {'Error' : `The user already has the max number of checks (${config.maxChecksPerUser})`})
                        }
                    } else {
                        callback(403)
                    }
                });
            } else {
                callback(403)
            }
        })
    } else {
        callback(400, {'Error' : 'Missing required inputs or inputs are invalid'})
    }
}


// Ping Handlers
handlers.ping = (data,cb) => {
    cb(200);
}

// Not Found handler
handlers.notFound = (data, callback) =>  {
    callback(404);
};

module.exports= handlers