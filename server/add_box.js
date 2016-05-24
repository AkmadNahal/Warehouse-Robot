import { dbClient } from './influxdb-compiled';
import { mongoClient } from './mongodb-compiled';
import { ObjectID } from './mongodb-compiled';
import { clientConSock } from './websocket-compiled';
import { sendCommandGateway } from './send_command_gateway-compiled';


function tryInsertBox(box, callback) {

    box._id = new ObjectID;
    // Get latest values from timestamp
    let startDeviceId = 1;

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
                            console.log('Inserting box into database...');
                            mongoClient.shelfCollection.update({"_id": result._id}, { $push: { "boxes": box } });
                            var x_coordinate = result.shelfLocation;
                            var y_coordinate = result.boxes.length+1;
                            sendCommandGateway('insert', box._id, x_coordinate, y_coordinate);
                            callback(result, box);
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

        let query = "select * from Devices  where " + deviceString + "and time > '2016-04-30' and time < '2016-05-18' Order by time DESC limit 3"
        dbClient.query(query, function (err, res) {
            influxResults = res[0];
            callback(influxResults);
        });
    }


    function findMatchingShelf(box, influxLatestValues, callback) {
        let filtredShelves = [];

/*
        for (let j = 0; j < influxLatestValues.length; j++) {
            if (box.prefTemp.max > influxLatestValues[j].temperature_celsius &&
                box.prefTemp.min < influxLatestValues[j].temperature_celsius &&
                box.prefLight.max > influxLatestValues[j].light_lux &&
                box.prefLight.min < influxLatestValues[j].light_lux
            ) {
                filtredShelves.push(influxLatestValues[j]);
            }
        }
       */

            var filtered = influxLatestValues.filter((sensorValue) =>
            box.prefTemp.max > sensorValue.temperature_celsius && box.prefTemp.min < sensorValue.temperature_celsius &&
            box.prefLight.max > sensorValue.light_lux &&
            box.prefLight.min < sensorValue.light_lux
        )

        callback(filtered);
    }


    function getShelfsMongo(callback) {
        let shelfArray = [];
        let cursor = mongoClient.shelfCollection.find();
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


/*

        for(let sensorValue of filteredShelfsArray) {
            mongoShelfArray = mongoShelfArray.filter((shelf) =>
            shelf.shelfLocation == sensorValue.Device_Id &&
            shelf.boxes.length < shelf.shelfCapacity
            )
        }

        if(mongoShelfArray.length > 0) {
            callback(mongoShelfArray[0])
        } else {
            callback(false);
        }
    }
*/


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

export { tryInsertBox };




/*
 var query = "select * " +
 "from Devices " +
 "where time > '2016-04-20' and time < '2016-04-21'  and Device_Id = 'd08c7b150006'";
 */



/*
 var box = {
 createdBy: 'john',
 prefTemp: {
 max: 24,
 min: 17
 },
 prefLight: {
 max: 4000,
 min: 0
 },
 pendingStorage: true		// True when processed by the robot. When the robot is done, it is set to false
 }

 var shelf = {
 shelfLocation: 1,
 shelfCapacity: 10,
 boxes: []		// An array of the boxObjects stored on the shelf, indexed by physical coordinate location
 }

 select * from Devices  where Device_Id = '3' and time > now() - 1h Order by time DESC limit 1


 var user = {
 userName: 'john',
 password: 'test1'
 }

 */


/*
 dbClient.query(queryNrOfArduinos, function(err, res) {
 nrOfArduinos = res[0].length;
 for(let i = 0; i < nrOfArduinos; i++) {
 query = "select * from Devices  where Device_Id = '" + deviceId + "' and time > now() - 72h Order by time DESC limit 1"
 dbClient.query(query, function(err, res) {
 influxResults.push(res[0][0]);
 if (influxResults.length === nrOfArduinos) {
 console.log(influxResults);

 for(let j = 0; j < influxResults.length; j++) {
 if( box.prefTemp.max > influxResults[j].temperature_celsius &&
 box.prefTemp.min < influxResults[j].temperature_celsius &&
 box.prefLight.max > influxResults[j].light_lux &&
 box.prefLight.min < influxResults[j].light_lux
 ) {
 console.log('Shelf ' + influxResults[j].Device_Id + ' is within range');

 mongoClient.shelfCollection.findOne({"shelfLocation": parseInt(influxResults[j].Device_Id) }, function(err, res2) {
 console.log(res2);
 if(res2.shelfCapacity > res2.boxes.length) {
 console.log('there is space!');
 mongoClient.shelfCollection.update({"_id": res2._id}, { $push: { "boxes": box } });
 insertFailed = false;
 j = influxResults.length;
 finalShelf = res2;
 } else {
 console.log('Found a good shelf, but shelf + ' + res2.shelfLocation + ' has no space!');
 }
 });
 }
 if(j === influxResults.length || j === influxResults.length-1) {
 if(insertFailed) {
 //                              clientConSock.emit('insert_failed');
 console.log('failed');
 callback(insert_failed';                 // callback(ar alltid failed. Beror formodligen pa att den inte vantar pa att
 } else {
 //                                clientConSock.emit('insert_succeeded', finalShelf);
 console.log('succeeded');
 callback(insert_succeeded';              // ...
 }
 }
 }
 }
 });
 deviceId++;
 }
 });
 }
 */