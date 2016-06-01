import { Client } from '../app-compiled';

let temp1 = 0;
let temp2 = 10;
let temp3 = 20;


function incTemp(shelfNr) {
    switch (shelfNr) {

        case '1':
            temp1++;
            break;

        case '2':
            temp2++;
            break;

        case '3':
            temp3++;
            break;
    }
}


function decTemp(shelfNr) {
    switch (shelfNr) {

        case '1':
            temp1--;
            break;

        case '2':
            temp2--;
            break;

        case '3':
            temp3--;
            break;
    }
}

function iotDeviceSetup(){

    const config = {
        "org" : "71hbg2",
        "id" : "1",
        "type" : "Arduino_board",
        "auth-method" : "token",
        "auth-token" : "fynxhXYZLmAlB35ir7"
    };

    const config_2 = {
        "org" : "71hbg2",
        "id" : "2",
        "type" : "Arduino_board",
        "auth-method" : "token",
        "auth-token" : "mPeCLA_t7mQMi2k25O"
    };

    const config_3 = {
        "org" : "71hbg2",
        "id" : "3",
        "type" : "Arduino_board",
        "auth-method" : "token",
        "auth-token" : "-3Icm8HvvUR+Wn+jXD"
    };

    let deviceClient = new Client.IotfDevice(config);
    let deviceClient_2 = new Client.IotfDevice(config_2);
    let deviceClient_3 = new Client.IotfDevice(config_3);

    deviceClient.connect();
    deviceClient_2.connect();
    deviceClient_3.connect();


    function publisher() {
        deviceClient.publish("event","json",'{"data" : { "temperature_celsius" : '+ temp1 +', "light_lux" : 300 }}');
        deviceClient_2.publish("event","json",'{"data" : { "temperature_celsius" : '+ temp2 +', "light_lux" : 100 }}');
        deviceClient_3.publish("event","json",'{"data" : { "temperature_celsius" : '+ temp3 +', "light_lux" : 600 }}');
    }

    deviceClient_3.on('connect', function () {
        console.log('succesfully connected to IBM Watson!');
        setInterval(publisher, 5000);
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
export { iotDeviceSetup, incTemp, decTemp };