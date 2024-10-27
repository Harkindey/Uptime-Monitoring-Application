/*
*   Request Handlers
*
*/
//Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define the handlers
let handlers = {};

// Users
handlers.users = (data, callback) => {
    var acceptableMethods = ['post','get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        cb(405);
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
                const hashPassword = helpers.hash(password);
                if(hashPassword){
                    // Create the user object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashPassword': hashPassword,
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
// @TODO only let aunthenticated user access their object. Don't let them access anyone
handlers._users.get = (data, callback)  => {
    // Check that the phone is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length === 11 ? data.queryStringObject.phone : false;

    if(phone) {
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
        callback(400, {'Error': 'Missing required field'});
    }

}
// Users - put
// Required Data: phone
// Optional data: firstName, LastName, password (at least one must be specified)
// @TODO only let aunthenticated user update their  own object. Don't let them update anyone else
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
        callback(400, {'Error': 'Missing required field'});
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