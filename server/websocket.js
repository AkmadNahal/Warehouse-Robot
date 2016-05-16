import { server } from '../app-compiled';
import { appClient } from './iot_application-compiled';
import { dbClient } from './influxdb-compiled';
import { tryInsertBox } from './add_box-compiled';
import { getAllBoxes } from './get_all_boxes-compiled.js'

var clientConSock;

function socketSetup() {

// Socket configuration

    const serverSocket = require('socket.io')(server);
    serverSocket.on('connection', function(ConSock) {
        clientConSock = ConSock;

        clientConSock.emit('hej', "Hejsan!")

        console.log("A client connected");

        var query = "select * " +
            "from Devices " +
            "where time > now() - 1h  and Device_Id = 'd08c7b150006'";

        /*
         var query = "select * " +
         "from Devices " +
         "where time > '2016-04-20' and time < '2016-04-21'  and Device_Id = 'd08c7b150006'";
         */


        dbClient.query(query, function(err, results) {
            clientConSock.emit('res_data', results);
            //    writeAfile(JSON.stringify(results));
        });

        clientConSock.on('add_box', function(box) {
            tryInsertBox(box, function(result, theBox) {
                clientConSock.emit('add_box_status', result, theBox);
            });
        });

        clientConSock.on('remove_box', function(boxId) {
            removeBox(boxId, function(result) {
                clientConSock.emit('remove_box_status', result);
            });
        });

        clientConSock.on('get_all_shelves', function() {
            // query database and get all box objects.
            // emit back a variable with all objects in an array
            getAllBoxes(function(result){
                console.log(result);
                clientConSock.emit('response_get_all_shelves', result);
            });
        });

    });
}

export { socketSetup, clientConSock };