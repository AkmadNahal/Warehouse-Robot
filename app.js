import { iotAppSetup } from './server/iot_application-compiled';
import { socketSetup } from './server/websocket-compiled';
import { influxDbSetup } from './server/influxdb-compiled';
import { iotDeviceSetup } from './server/iot_devices-compiled';
import{ mongoDbSetup } from './server/mongodb-compiled';
import {commandRouter} from "./server/command_router-compiled";
//import {removeBox} from "./server/remove_box";

export const express = require('express');
export const app = express();
export const server = require('http').createServer(app);
export const Client = require('ibmiotf');
export const request = require('request');
const bodyParser = require('body-parser');


iotAppSetup();
socketSetup();
influxDbSetup();
iotDeviceSetup();
mongoDbSetup();
//removeBox('5738cc9add773eec2fa15186', function() { });

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/html/info2.html');
});

app.get('/add_box', function(req,res) {
    res.sendFile(__dirname + '/client/html/addbox.html');
});

app.get('/graphstaticdata', function(req,res) {
    res.sendFile(__dirname + '/client/graphStaticData.html');
});

app.get('/info', function(req,res) {
    res.sendFile(__dirname + '/client/html/info.html');
});

app.get('/info2', function(req,res) {
    res.sendFile(__dirname + '/client/html/info2.html');
});

app.get('/images/scroll-to-top', function(req,res) {
        res.sendFile(__dirname + '/client/images/scroll-to-top.png');
    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/commandResponse', function (req, res) {

        console.log('Command Response:');
        console.log(req.body);
        console.log(req.body.x);
        console.log(req.body.y);
        console.log(req.body.id);
        commandRouter(req.body);
});

server.listen(process.env.PORT || 5000);

console.log("server is running on 5000...");