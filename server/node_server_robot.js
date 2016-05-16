export const express = require('express');
export const app = express();
export const server = require('http').createServer(app);
export const request = require('request');
const bodyParser = require('body-parser');
const zerorpc = require('zerorpc');

var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");



//app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/command', function (req, res) {
    console.log(req.body);
    console.log(req.body.x);
    console.log(req.body.y);
    console.log(req.body.id);
    if(req.body.command == 'insert') {
        client.invoke("insert", req.body.command, req.body.x, req.body.y, req.body.id, function(error, res, more) {
            console.log(res);
        });
    }
    if( req.body.command == 'remove') {
        client.invoke("remove", req.body.command, req.body.x, req.body.y, req.body.id, function(error, res, more) {
            console.log(res);
        });
    }

//    process.stdout.write(req.body);
});
server.listen(8002);

console.log("Robot server is running on 8002...");