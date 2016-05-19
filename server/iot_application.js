import { Client } from '../app-compiled';
import { dbClient } from './influxdb-compiled';

let appClient;
const iotAppSetup = function() {

    const appClientConfig = {
        'org' : '71hbg2',
        'id' : '1',
        'auth-key' : 'a-71hbg2-vbimsngp5s',
        'auth-token' : 'tCJWyt)+2@xJW3Ry1G',
        'type' : 'shared' // make this connection as shared subscription
    };

    appClient = new Client.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on('connect', function() {
        console.log('Application connected!');
        appClient.subscribeToDeviceEvents();    // Subscribe to all events on all devices!!
    });

    appClient.on('deviceEvent', function(deviceType, deviceId, eventType, format, payload) {

        //console.log("Device Event from :: " + deviceType + " : " + deviceId + " of event " + eventType + " with payload : " + payload);
        let deviceData = (JSON.parse(payload.toString())).data;

        dbClient.writePoint('Devices', {
            temperature_celsius: deviceData.temperature_celsius,
            light_lux: deviceData.light_lux
        }, {Device_Id: deviceId}, function (err, response) {
        });
    });
    
// Error handling application

    appClient.on('error', function (err) {
        console.log('Error : ' + err);
    });

}

export { iotAppSetup, appClient };