import { server } from '../app-compiled';
import { appClient } from './iot_application-compiled';
import { dbClient } from './influxdb-compiled';
import { tryInsertBox } from './not_yet_implemented/decisionmaker-compiled';

var clientConSock;

function socketSetup() {

// Socket configuration

    const serverSocket = require('socket.io')(server);
    serverSocket.on('connection', function(ConSock) {
        clientConSock = ConSock;
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
            tryInsertBox(box, function(result) {
                clientConSock.emit('add_box_status', result);
            });
        });
    });
}

export { socketSetup, clientConSock };