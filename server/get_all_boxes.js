import { mongoClient } from './mongodb-compiled';
import { clientConSock } from './websocket-compiled'
import { dbClient } from './influxdb-compiled.js'

function getAllBoxes(callback) {
    let cursor = mongoClient.shelfCollection.find();

    cursor.each((err, doc) => {
        if(err) {
            console.log(err);
        } else {
            if(doc != null) {
                getInfluxData(doc.shelfLocation,function(data) {
                    callback(doc, data);
                })
            }
        }
    });
}

function getInfluxData(device, callback) {

    var query = "select * " +
        "from Devices " +
        "where time > '2016-05-15' and Device_Id = '" + device + "'" +'limit 10';
    dbClient.query(query, (err, results) => {
        callback(results);
        //    writeAfile(JSON.stringify(results));
    });
 }

export {getAllBoxes}

//select * from Devices where time > '2016-05-15' and Device_Id = '1' 'limit 10';