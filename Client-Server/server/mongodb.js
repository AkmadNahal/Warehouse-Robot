var mongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;


function mongoDbSetup() {
    var mongoUrl = 'mongodb://localhost:27017/test';
    var shelf = {
        shelfLocation: 1,
        shelfCapacity: 3,
        boxes: ['','','']		// An array of the boxObjects stored on the shelf, indexed by physical coordinate location
    }
    var shelf1 = {
        shelfLocation: 2,
        shelfCapacity: 3,
        boxes: ['','','']		// An array of the boxObjects stored on the shelf, indexed by physical coordinate location
    }
    var shelf2 = {
        shelfLocation: 3,
        shelfCapacity: 3,
        boxes: ['','','']// An array of the boxObjects stored on the shelf, indexed by physical coordinate location
    }

    mongoClient.connect(mongoUrl, function(err, db) {
        if(!err) {
            console.log("Connected to database...");
            mongoClient.userCollection = db.collection('users');
            mongoClient.shelfCollection = db.collection('shelves');
            //mongoClient.shelfCollection.insert(shelf);
            //mongoClient.shelfCollection.insert(shelf1);
            //mongoClient.shelfCollection.insert(shelf2);
        };
    });
}

export { mongoDbSetup, mongoClient, ObjectID }


/*
Client connected, show all database documents.


clientConSock.on('req_all_database', function() {
    var cursor = recipesCollection.find();
    cursor.each(function(err, doc) {
        if(err) {
        } else {
            if(doc != null) {
                clientConSock.emit('res_all_database', JSON.stringify(doc));
            }
        }
    });
});

// Client input a name of a drink, insert into database
clientConSock.on('insert_database', function(data) {
    recipesCollection.insert(data);
    clientConSock.emit('insert_succesful');
});

// Client input a string, fetch from database and return. Search function.
clientConSock.on('search_database', function(data) {
    data = JSON.parse(data);
    var ingQuery = true;
    for (var i = 0; i < data.length; i++) {
        if (data[i][0] == true) {
            // A drinkname has been found, do the first drinkname.
            ingQuery = false;
            var cursor = recipesCollection.find({'name': data[i][1]});
            cursor.each(function(err, doc) {
                if(err) {
                    console.log(err);
                } else {
                    if(doc != null) {
                        clientConSock.emit('search_succesful', JSON.stringify(doc));
                    }
                }
            });
            i = data.length;
        }
    }

    // No drinknames in query, only ingredients

    if (ingQuery) {
        var cursor2;
        if (data.length == 0) {
            cursor2 = recipesCollection.find();
        } else if(data.length == 1) {
            cursor2 = recipesCollection.find( {
                ingredients: { $all: [
                    { "$elemMatch" : { name: data[0][1] } }
                ] }
            } );
        } else if(data.length == 2) {
            cursor2 = recipesCollection.find( {
                ingredients: { $all: [
                    { "$elemMatch" : { name: data[0][1] } },
                    { "$elemMatch" : { name : data[1][1] } }
                ] }
            } );
        } else if(data.length == 3) {
            cursor2 = recipesCollection.find( {
                ingredients: { $all: [
                    { "$elemMatch" : { name: data[0][1] } },
                    { "$elemMatch" : { name : data[1][1] } },
                    { "$elemMatch" : { name : data[2][1] } }
                ] }
            } );
        } else {
            cursor2 = recipesCollection.find( {
                ingredients: { $all: [
                    { "$elemMatch" : { name : data[0][1] } },
                    { "$elemMatch" : { name : data[1][1] } },
                    { "$elemMatch" : { name : data[2][1] } },
                    { "$elemMatch" : { name : data[3][1] } }
                ] }
            } );
        }
        cursor2.each(function(err, doc) {
            if(err) {
                console.log(err);
            } else {
                if(doc != null) {
                    clientConSock.emit('search_succesful', JSON.stringify(doc));
                }
            }
        });
    }
});


// Client wants to retrieve all the ingredients for the token array
clientConSock.on('req_all_ingredients', function() {
    var cursor = [ingredientsCollection.find(), recipesCollection.find()];
    for (var i = 0; i < cursor.length; i++) {
        cursor[i].each(function(err, doc) {
            if(err) {
                console.log(err);
            } else {
                if(doc != null) {
                    clientConSock.emit('res_all_ingredients', JSON.stringify(doc));
                }
            }
        });
    }
});
});
*/
