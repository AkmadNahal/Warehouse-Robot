import { request } from '../app-compiled';
import { writeAfile } from './createDataDump-compiled';

export function postRequest() {

    const fs = require('fs');

    var username = "",
        password = "",
        url = "https://efxrqp.internetofthings.ibmcloud.com/api/v0002/device/types/gateway/devices",
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64"),
        deviceId = os.hostname(),
        body = {
            deviceId: deviceId,
            deviceInfo: {
                serialNumber: "6c:ec:eb:5c:59:1a",
                manufacturer: "UPWIS AB",
                model: "BBB",
                deviceClass: "6loWPAN",
                description: "6loWPAN router, mqtt broker",
                fwVersion: "1.0",
                hwVersion: "1.0",
                descriptiveLocation: "Salagatan 18B, Uppsala"
            },
            location: {
                longitude: 0,
                latitude: 0,
                elevation: 0,
                accuracy: 0,
                measuredDateTime: "2016-04-21T13:42:27.593Z"
            },
            metadata: {}
        }

    request.post(
        {
            url : url,
            headers : {
                "Authorization" : auth,
                "content-type"  : 'application/json'
            },
            body : JSON.stringify(body)
        },
        function (error, response, body) {
            var payload = JSON.parse(body);
            console.log(payload.authToken);
            writeAfile('../../../../../credentials.txt', payload.authToken);
        }
        // should be positioned in user directory
        // . . . .  /etc/mosquitto/conf.d/credentials.conf
    );
}