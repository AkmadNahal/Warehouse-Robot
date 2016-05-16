import { request } from '../app-compiled';

export function sendCommandGateway(command, id, x, y) {

    const fs = require('fs');

    var url = "http://localhost:8002/command",
        body = {
            command,
            x,
            y,
            id,
        };

    console.log('prover');

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