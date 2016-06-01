const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const zerorpc = require('zerorpc');
import {sendCommandServer} from "./send_command_server-compiled";

var client = new zerorpc.Client({timeout:120, heartbeatInterval:500000000});
client.connect("tcp://ev3dev.local:4242");

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

        try {
            res = JSON.parse(res);
            console.log(res);
            console.log(res.command);
            console.log(res.ID);

            if(commandBuffer != 0 ) {
                let nextCommand = commandBuffer.shift;
                runCommand(nextCommand);
                sendCommandServer(true,res.command, res.ID,0,0);
            } else {
                sendCommandServer(true,res.command, res.ID,0,0);
                console.log('no more commands!');
            }
        } catch (Error) {
            console.log(Error);
        }
    });


}



server.listen(8002);

console.log("Robot server is running on 8002...");