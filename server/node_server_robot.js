export const express = require('express');
export const app = express();
export const server = require('http').createServer(app);
export const request = require('request');
const bodyParser = require('body-parser');
const zerorpc = require('zerorpc');

var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");

let commandBuffer = [];

//app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/command', function (req, res) {


    if(commandBuffer.length == 0) {
        console.log(req.body);
        console.log(req.body.x);
        console.log(req.body.y);
        console.log(req.body.id);
        runCommand(req.body);
    } else {
        commandBuffer.push(req.body);
    }
//    process.stdout.write(req.body);
});



function runCommand(currentCommand) {
    client.invoke("send_command", currentCommand.command, currentCommand.x, currentCommand.y, currentCommand.id, function(error, res, more) {
        console.log(error);
        console.log(more);
        console.log(res);
        if(commandBuffer != 0 ) {
            let nextCommand = commandBuffer.shift;
            runCommand(nextCommand);
            sendCommandGateway(res);
        } else {
            //sendCommandGateway(res);
            console.log('no more commands!');
        }
    });
}



server.listen(8002);

console.log("Robot server is running on 8002...");