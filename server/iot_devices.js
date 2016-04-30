import { Client } from '../app-compiled';

function iotDeviceSetup(){

    const config = {
        "org" : "b3g117",
        "id" : "1",
        "type" : "E103",
        "auth-method" : "token",
        "auth-token" : "fD5OmRolF8_qpX27C9"
    };

    let deviceClient = new Client.IotfDevice(config);

    deviceClient.connect();

    deviceClient.on('connect', function () {
        console.log('succesfully connected to IBM Watson!');
    });

    deviceClient.on('command', function(commandName, format, payload, topic) {
        console.log('commandName ' + commandName);
        console.log('format ' + format);
        console.log('payload ' + payload);
        console.log('topic ' + topic);
    });

// Error handling

    deviceClient.on("error", function (err) {
        console.log("Error : "+err);
    });
}
export { iotDeviceSetup };