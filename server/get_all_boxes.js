import { mongoClient } from './mongodb-compiled';
import { clientConSock } from './websocket-compiled'

function getAllBoxes(callback) {
    let cursor = mongoClient.shelfCollection.find();
    console.log(cursor);

    cursor.each(function(err, doc) {
        if(err) {
            console.log(err);
        } else {
            if(doc != null) {
                console.log(doc);
                callback(doc);
            }
        }
    });
}

export {getAllBoxes}