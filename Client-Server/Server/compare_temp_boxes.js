import {mongoClient} from "./mongodb-compiled";
import {sendClientTempOutsideRange} from "./websocket-compiled";
import {checkCountShelf} from "./self_org-compiled";
import {clearCountBox} from "./self_org-compiled";
import {addCountBox} from "./self_org-compiled";

function compareTempToBoxes(deviceData, deviceId) {

    // query mongo db, look inside the current shelf (deviceId) and if inside max, min.

    /*    let cursor = mongoClient.shelfCollection.find({"shelfLocation": parseInt(deviceId), "boxes": {
     "$elemMatch": {
     "$or": [
     {"prefTemp.min": {"$gt": deviceData.temperature_celsius }},
     {"prefTemp.max": {"$lt": deviceData.temperature_celsius }}
     ]
     }
     }
     });*/

    let cursor = mongoClient.shelfCollection.find({'shelfLocation': parseInt(deviceId)});

    cursor.each((err, doc) => {
        if(err){
            console.log(err);
        } else {
            if(doc != null) {
                for(let i = 0; i < doc.shelfCapacity; i++) {

                    if(doc.boxes[i] !== '') {
                        if( doc.boxes[i].prefTemp.max < deviceData.temperature_celsius) {
                            sendClientTempOutsideRange('max', doc.boxes[i]);
                            addCountBox(doc.boxes[i]._id);
                            checkCountShelf(doc.boxes[i]._id,deviceId);
                        } else if (doc.boxes[i].prefTemp.min > deviceData.temperature_celsius) {
                            sendClientTempOutsideRange('min', doc.boxes[i]);
                            addCountBox(doc.boxes[i]._id);
                            checkCountShelf(doc.boxes[i]._id, deviceId);
                        } else {
                            clearCountBox(doc.boxes[i]._id);
                        }
                    }
                }
            }
        }
    });


    /*
     mongoClient.shelfCollection.find({"shelfLocation": "deviceId", "boxes": {"$elemMatch": {"$or":  [
     {"prefTemp.min": {"$gt": deviceData.temperature_celsius }}, {"prefTemp.max": {"$lt": deviceData.temperature_celsius }}]}}});


     db.shelves.find({"boxes": {"$elemMatch": {"$or": [{"prefTemp.max": {"$lt": 21}}, {"prefTemp.min": {"$gt": 54 } }]}}})

     */
    // return object that is outside



    //db.shelves.find({"boxes": {"$elemMatch": {"prefTemp.min": {"$gt": 4 } }}})

}

export {compareTempToBoxes};