import {ObjectID, mongoClient} from "./mongodb-compiled";
import {relocateBox} from "./relocate_box-compiled";

function addCountBox(boxId) {
    let box_id = new ObjectID(boxId);
    mongoClient.shelfCollection.update({"boxes._id": box_id}, { $inc: { "boxes.$.tempCount": 1 } } );
}

function clearCountBox(boxId) {
    let box_id = new ObjectID(boxId);
    mongoClient.shelfCollection.update({"boxes._id": box_id}, { $set: { "boxes.$.tempCount": 0 } } );
}

function checkCountShelf(boxId, shelfLocation) {
    let box_id = new ObjectID(boxId);
    let query = {
        boxes: {
            "$elemMatch": {
                _id: box_id
            }
        }
    };

    mongoClient.shelfCollection.findOne(query, (err, res) => {
        for(let i = 0; i < res.boxes.length; i++) {
            if(res.boxes[i] !== '') {
                if(parseInt(res.boxes[i]._id) === parseInt(boxId)) {

                    console.log('checking if boxcount is above 10..');
                    if(res.boxes[i].tempCount > 2) {
                        console.log('Box count over 10! ' + res.boxes[i].tempCount);
                        relocateBox(res.boxes[i], shelfLocation, i+1);
                    }
                }
            }
        }
    });


    //{"$match": {"boxes._id": box_id}},{"$project": {"_id": false, "tempCount": true}

}

export {addCountBox, clearCountBox, checkCountShelf};

// 'relocate, 'x1 x2', 'y1 y2', boxid,