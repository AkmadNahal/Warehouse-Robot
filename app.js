import { iotAppSetup } from './server/iot_application-compiled';
import { socketSetup } from './server/websocket-compiled';
import { influxDbSetup } from './server/influxdb-compiled';
import { postRequest } from './server/postRequest-compiled';

export const express = require('express');
export const app = express();
export const server = require('http').createServer(app);
export const Client = require('ibmiotf');
export const request = require('request');


iotAppSetup();
socketSetup();
influxDbSetup();

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/app.html');
});

app.get('/graphlivedata', function(req,res) {
    res.sendFile(__dirname + '/client/graphLiveData.html');
});

app.get('/graphstaticdata', function(req,res) {
    res.sendFile(__dirname + '/client/graphStaticData.html');
});

server.listen(process.env.PORT || 5000);

console.log("server is running...");