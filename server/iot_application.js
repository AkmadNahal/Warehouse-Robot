
import { Client } from '../app-compiled';
import { dbClient } from './influxdb-compiled';

let appClient;
const iotAppSetup = function() {

    const appClientConfig = {
        'org' : 'b3g117',
        'id' : '1',
        'auth-key' : 'a-b3g117-8ilefufd96',
        'auth-token' : '@jwCfBpz(fhh6Jo5OJ',
        'type' : 'shared' // make this connection as shared subscription
    };

    appClient = new Client.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on('connect', function() {
        console.log('Application connected!');
        appClient.subscribeToDeviceEvents();    // Subscribe to all events on all devices!!
    });


    appClient.on('deviceEvent', function(deviceType, deviceId, eventType, format, payload) {

        console.log(deviceType);
        console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);

        let deviceData = (JSON.parse(payload.toString())).d;

        // Values
        let myName = deviceData['myName'];

        if(deviceType === 'N101') {

            // status

            let uptime = deviceData['Uptime (sec)'];
            let pwrCons = deviceData['VDD3 (mV)'];          // vdd
            let chipTemp = deviceData['On-Chip Temp (C)'];  // chipTemp
            let RSSI = deviceData['RSSI (dBm)']; // rssi radio strength
            let defRoute = deviceData['Def Route'];

            // fields (values)

            let seqNr = deviceData['Seq #']; // seq
            let ambTemp = deviceData['Ambiental Temp (mC)']; // ambTemp
            let light = deviceData['Light (Lux)'];          // light

            // Tags

            dbClient.writePoint('Devices', { Seq_nr : seqNr, Uptime_sec: uptime, RSSI_dbm: RSSI, Ambient_temp : ambTemp, Light_lux : light, Chip_temp : chipTemp,  VDD3_mV : pwrCons }, { Device_Id : deviceId, myName: myName , Def_route: defRoute }, function(err, response){});
        }

        if(deviceType === 'E103') {
            let uptime = deviceData['Uptime (sec)'];
            let seqNr = deviceData['Seq #'];
            let RSSI = deviceData['RSSI (dBm)'];
            let chipTemp = deviceData['On-Chip Temp (C)'];
            let pwrCons = deviceData['VDD3 (mV)'];

            // Tags
            let defRoute = deviceData['Def Route'];

            dbClient.writePoint('Devices', { Seq_nr : seqNr, Uptime_sec: uptime, RSSI_dbm: RSSI, Chip_temp : chipTemp,  VDD3_mV : pwrCons }, { Device_Id : deviceId, myName: myName , Def_route: defRoute }, function(err, response){});
        }
        });

// Error handling application

    appClient.on('error', function (err) {
        console.log('Error : ' + err);
    });

}

export { iotAppSetup, appClient };