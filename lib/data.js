/*
*   Library for storing data
*
*/

const fs = require('fs');
const path =require('path');
const helpers = require('./helpers');

// Container for the module (to be exported)

const lib = {};

// Define base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/')

//Write data to a file
lib.create = (dir, file, data, callback) => {
    // Open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx',(err, fileDescriptor) => {
        if(!err && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback(false)
                        } else {
                            callback('Error closing new file')
                        }
                    });
                } else {
                    callback('Error writing to new File');
                };
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    })
};

// Read from a file
lib.read = (dir,file, callback) =>  {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', (err, data) => {
        if(!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData)
        } else {
            callback(err, data)
        }
        
    })
}


// Update a file
lib.update = (dir, file, data, callback) => {
    // Open thw file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if(!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err)=> {
                        if(!err){
                            fs.close(fileDescriptor, (err) => {
                                if(!err){
                                    callback(false)
                                } else {
                                    callback('Error closing file')
                                }
                            })
                        } else {
                            callback("Error writing to existing file")
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })

        } else {
            callback("Could not open file for updating, it may not exist yet")
        }
    })
}

// Delete a File

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
        if(!err){
            callback(false)
        } else {
            callback("Error Deleting file, maybe it doesn't exist")
        }
    })
}


// List all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+'dir'+'/', (err, data) => {
        if(!err && data && data.length > 0) {
            var trimmedFieldNames = [];
            data.forEach((fileName) => {
                trimmedFieldNames.push(fileName.replace('.json', ''))
            });
            callback(false, trimmedFieldNames);
        } else {
            callback(err, data)
        }
    })
}





// Export the Module
module.exports = lib