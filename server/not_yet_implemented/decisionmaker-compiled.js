'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tryInsertBox = undefined;

var _influxdbCompiled = require('./../influxdb-compiled');

var _mongodbCompiled = require('./../mongodb-compiled');

var _websocketCompiled = require('./../websocket-compiled');

function tryInsertBox(box) {

    // Get latest values from timestamp

    box._id = new _mongodbCompiled.ObjectID();
    var influxResults = [];
    var query = "";
    var queryNrOfArduinos = "SHOW TAG VALUES FROM Devices WITH KEY = Device_Id";
    var nrOfArduinos = 0;
    var deviceId = 1;
    var insertFailed = true;
    var finalShelf = {};

    _influxdbCompiled.dbClient.query(queryNrOfArduinos, function (err, res) {
        nrOfArduinos = res[0].length;
        for (var i = 0; i < nrOfArduinos; i++) {
            query = "select * from Devices  where Device_Id = '" + deviceId + "' and time > now() - 72h Order by time DESC limit 1";
            _influxdbCompiled.dbClient.query(query, function (err, res) {
                influxResults.push(res[0][0]);

                if (influxResults.length === nrOfArduinos) {
                    console.log(influxResults);

                    for (var j = 0; j < influxResults.length; j++) {
                        if (box.prefTemp.max > influxResults[j].temperature_celsius && box.prefTemp.min < influxResults[j].temperature_celsius && box.prefLight.max > influxResults[j].light_lux && box.prefLight.min < influxResults[j].light_lux) {
                            console.log('Shelf ' + influxResults[j].Device_Id + ' is within range');

                            _mongodbCompiled.mongoClient.shelfCollection.findOne({ "shelfLocation": parseInt(influxResults[j].Device_Id) }, function (err, res2) {
                                console.log(res2);
                                if (res2.shelfCapacity > res2.boxes.length) {
                                    console.log('there is space!');
                                    _mongodbCompiled.mongoClient.shelfCollection.update({ "_id": res2._id }, { $push: { "boxes": box } });
                                    insertFailed = false;
                                    j = influxResults.length;
                                    finalShelf = res2;
                                } else {
                                    console.log('Found a good shelf, but shelf + ' + res2.shelfLocation + ' has no space!');
                                }
                            });
                        }
                        if (j === influxResults.length || j === influxResults.length - 1) {
                            if (insertFailed) {
                                //                              clientConSock.emit('insert_failed');
                                console.log('failed');
                                return 'insert_failed';
                            } else {
                                //                                clientConSock.emit('insert_succeeded', finalShelf);
                                console.log('succeeded');
                                return 'insert_succeeded';
                            }
                        }
                    }
                }
            });
            deviceId++;
        }
    });

    /*
     var query = "select * " +
     "from Devices " +
     "where time > '2016-04-20' and time < '2016-04-21'  and Device_Id = 'd08c7b150006'";
     */
}
exports.tryInsertBox = tryInsertBox;

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

//# sourceMappingURL=decisionmaker-compiled.js.map