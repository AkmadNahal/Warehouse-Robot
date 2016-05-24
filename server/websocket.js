import { server } from '../app-compiled';
import { appClient } from './iot_application-compiled';
import { dbClient } from './influxdb-compiled';
import { tryInsertBox } from './add_box-compiled';
import { getAllBoxes } from './get_all_boxes-compiled.js';
import { removeBox } from './remove_box-compiled';
import {moveRobot} from "./move_robot-compiled";


var clientConSock;

function socketSetup() {

// Socket configuration

    const serverSocket = require('socket.io')(server);
    serverSocket.on('connection', (ConSock) => {
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


        dbClient.query(query, (err, results) => {
            clientConSock.emit('res_data', results);
            //    writeAfile(JSON.stringify(results));
        });

        clientConSock.on('add_box', (box) => {
            tryInsertBox(box, (result, theBox) => {
                clientConSock.emit('add_box_status', result, theBox);
            });
        });

        clientConSock.on('remove_box', (boxId) => {
            removeBox(boxId, function (box, status) {
                clientConSock.emit('remove_box_status', box, status);
            });
        });

        clientConSock.on('get_all_shelves', () => {
            // query database and get all box objects.
            // emit back a variable with all objects in an array
            console.log('get all shelves called');
            getAllBoxes((result1, result2) => {
                clientConSock.emit('response_get_all_shelves', result1, result2);
            });
        });

/*
        setTimeout(function() {
            clientConSock.emit('box_update')
        }, 8000);
*/

        /*
        clientConSock.on('move_robot', (x,y) => {
            console.log(x, y);
            moveRobot(x,y, (result) => {
                console.log('robot moved!');
                clientConSock.emit('robot_move_status', result);
            });
        });
        */


    });
}

export { socketSetup, clientConSock };