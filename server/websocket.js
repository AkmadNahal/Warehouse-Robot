import { server } from '../app-compiled';
import { appClient } from './iot_application-compiled';
import { dbClient } from './influxdb-compiled';
import { tryInsertBox } from './add_box-compiled';
import { getAllBoxes } from './get_all_boxes-compiled.js';
import { removeBox } from './remove_box-compiled';
import {sendCommandServer} from "./send_command_server-compiled";
import {incTemp, decTemp} from "./iot_devices-compiled";


var clientConSock = null;
var serverSocket;

function sendSensorUpdateClient(string, deviceData, deviceId) {
    if(clientConSock) {
        clientConSock.emit(string, deviceData, deviceId);
        clientConSock.broadcast.emit(string, deviceData, deviceId);
    }
}

function sendClientTempOutsideRange(minOrMax,box) {
    clientConSock.emit('temp_outside_range', minOrMax, box);
    clientConSock.broadcast.emit('temp_outside_range', minOrMax, box);
}

function sendRobotUpdateClient(command, id) {
    if(clientConSock){
        clientConSock.emit('robot_status_update', command, id);
        clientConSock.broadcast.emit('robot_status_update', command, id);
    }
}

function socketSetup() {

// Socket configuration

    serverSocket = require('socket.io')(server);
    serverSocket.on('connection', (ConSock) => {
        clientConSock = ConSock;

        console.log("A client connected");

        clientConSock.on('add_box', (box) => {
            tryInsertBox(box,false, (result, theBox) => {
                clientConSock.emit('add_box_status', result, theBox);
                clientConSock.broadcast.emit('add_box_status', result, theBox);
            });
        });

        clientConSock.on('remove_box', (boxId) => {
            console.log(boxId);
            removeBox(false, boxId, function (box, status) {
                clientConSock.emit('remove_box_status', box, status);
                clientConSock.broadcast.emit('remove_box_status', box, status);
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

        clientConSock.on('move_command', (coordinates, id) => {
            console.log(coordinates);
            console.log(id);
            sendCommandServer(false, 'move', id, coordinates.x, coordinates.y);
        });

        clientConSock.on('inc_temp', (shelfNr) => {
            incTemp(shelfNr);
        });

        clientConSock.on('dec_temp', (shelfNr) => {
            decTemp(shelfNr);
        });




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

export { socketSetup, clientConSock, sendRobotUpdateClient, sendSensorUpdateClient, sendClientTempOutsideRange };