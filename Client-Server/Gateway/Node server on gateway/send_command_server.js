const request = require('request');

export function sendCommandServer(isGateWay, command, id, x, y) {

    const fs = require('fs');

    var url = isGateWay ? "http://localhost:5000/commandResponse" : "http://localhost:8002/command";

    var body = {
            command,
            x,
            y,
            id,
        };

    request.post(
        {
            url : url,
            headers : {
                "content-type"  : 'application/json'
            },
            body : JSON.stringify(body)
        },
        function (error, response, body) {
//            var payload = JSON.parse(body);
//            console.log(payload);
        }
    );
}