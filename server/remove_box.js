import { mongoClient } from './mongodb-compiled';
import { sendCommandGateway } from './send_command_gateway-compiled';

/*function removeBox(boxId, callback) {

    // findone shelf
    // remove boxId
    // sendCommand
    // send signal client

    findShelf(boxId, function(result) {
        console.log(result);
    });



/*

        removeBoxFromDb(boxId,
            sendCommandGateway('remove', boxId,
                sendCommandGateway('remove', boxId, ),
                callback('Removed box ' + boxId + '.')));
*/

/*
    function findShelf(boxId, callback) {

        let doc = mongoClient.shelfCollection.findOne( {
            boxes: { $all: [
                { "$elemMatch" : { _id: boxId } }
            ] }
        });




        callback(doc);

        /*cursor2 = recipesCollection.find( {
            ingredients: { $all: [
                { "$elemMatch" : { name: data[0][1] } }
            ] }
        } );



         findOne( { boxes: { $all: [{ "$elemMatch" : { _id: "5738cc9add773eec2fa15186" } }  ] }



        */
/*
    }

    function removeBoxFromDb(boxId, callback1, callback2) {

    }

*/
/*



    getNrOfArduinos(function (aNrOfArduinos) {
        let nrOfArduinos = aNrOfArduinos;
        getLatestValues(nrOfArduinos, startDeviceId, function (latestValuesArray) {
            findMatchingShelf(box, latestValuesArray, function (afilteredShelvs) {
                let filteredShelvs = afilteredShelvs;
                getShelfsMongo(function (mongoShelves) {
                    findFreeShelf(filteredShelvs, mongoShelves, function (result) {
                        if (result === false) {
                            console.log('failed to find a shelf');
                            callback('Failed to find a shelf');
                        } else {
                            console.log('the box: ' + JSON.stringify(box));
                            console.log('found a shelf: ' + JSON.stringify(result));
                            console.log('temperature in shelf: ' + JSON.stringify(filteredShelvs));
                            console.log('Inserting box into database...');
                            mongoClient.shelfCollection.update({"_id": result._id}, { $push: { "boxes": box } });
                            var x_coordinate = result.shelfLocation;
                            var y_coordinate = result.boxes.length;
                            postRequest('insert', box._id, x_coordinate, y_coordinate);
                            callback('Inserting box. found a shelf: ' + JSON.stringify(result));
                        }
                    })
                })
            })
        })
    });

    function getNrOfArduinos(callback) {
        let queryNrOfArduinos = "SHOW TAG VALUES FROM Devices WITH KEY = Device_Id";
        dbClient.query(queryNrOfArduinos, function (err, res) {
            callback(res[0].length);
        });
    }

    function getLatestValues(nrOfDevices, startDeviceId, callback) {
        let influxResults = [];
        let deviceString = '';

        for (let i = startDeviceId; i <= nrOfDevices; i++) {
            deviceString = deviceString + "Device_Id = '" + i + "' ";
            if (i !== nrOfDevices) {
                deviceString = deviceString + "or ";
            }
        }

        let query = "select * from Devices  where " + deviceString + "and time > '2016-04-30' and time < '2016-05-16' Order by time DESC limit 3"
        dbClient.query(query, function (err, res) {
            influxResults = res[0];
            console.log(influxResults);
            callback(influxResults);
        });
    }


    function findMatchingShelf(box, influxLatestValues, callback) {
        let filtredShelves = [];
        for (let j = 0; j < influxLatestValues.length; j++) {
            if (box.prefTemp.max > influxLatestValues[j].temperature_celsius &&
                box.prefTemp.min < influxLatestValues[j].temperature_celsius &&
                box.prefLight.max > influxLatestValues[j].light_lux &&
                box.prefLight.min < influxLatestValues[j].light_lux
            ) {
                filtredShelves.push(influxLatestValues[j]);
            }
        }
        callback(filtredShelves);
    }

    function getShelfsMongo(callback) {
        let shelfArray = [];
        let cursor = mongoClient.shelfCollection.find({});
        cursor.each(function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                if (doc != null) {
                    shelfArray.push(doc);
                } else {
                    callback(shelfArray);
                }
            }
        });
    }

    function findFreeShelf(filteredShelfsArray, mongoShelfArray, callback) {
        let foundShelf = false;
        let theShelf = [];
        for (let i = 0; i < filteredShelfsArray.length; i++) {
            for (let j = 0; j < mongoShelfArray.length; j++) {
                if (
                    filteredShelfsArray[i].Device_Id == mongoShelfArray[j].shelfLocation &&
                    mongoShelfArray[j].boxes.length < mongoShelfArray[j].shelfCapacity
                ) {
                    foundShelf = true;
                    theShelf = mongoShelfArray[j];
                }
            }
        }
        if(foundShelf) {
            callback(theShelf);
        } else {
            callback(false);
        }
    }
}
}
export { removeBox };
 */

