import {mongoClient} from "./mongodb-compiled";
import {ObjectID} from "./mongodb-compiled";

function changePendingStorage(boxId) {

    let ObjectId = new ObjectID(boxId);
    let query = {"boxes._id": ObjectId};
    let update = { "$set": { "boxes.$.pendingStorage": false } };

    mongoClient.shelfCollection.update(query, update);
}

export {changePendingStorage};