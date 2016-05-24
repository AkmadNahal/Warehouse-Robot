import { mongoClient } from './mongodb-compiled';
import { sendCommandGateway } from './send_command_gateway-compiled';
import {ObjectID} from "./mongodb-compiled";

function removeBox(boxId, callback) {

    // findone shelf
    // remove boxId
    // sendCommand
    // send signal client


    findShelf(boxId, function (shelf) {
        let theShelf = shelf;
        removeBoxFromDb(theShelf, boxId);
        sendCommandGateway('remove',boxId._id, theShelf.shelfLocation, theShelf.yPos);
        callback(boxId, true);
    });

    //        let query = { "boxes": { "$elemMatch": { "_id": "ObjectId(" + "'boxId' + ")" } } };


    function findShelf(boxId, callback) {

        let box_id = new ObjectID(boxId);
        let query = {
            boxes: {
                "$elemMatch": {
                    _id: box_id
                }
            }
        };


        //    let query =  '{ "boxes": { "$elemMatch": { "_id": "ObjectId("' + boxId + '")" } } }';

        mongoClient.shelfCollection.findOne(query, (err, res) => {
                console.log(res);
                callback(res);
                for(let i = 0; i < res.boxes.length; i++) {
                    if(res.boxes[i] == boxId) {
                        res.yPos = i;
                    }
                }
            }
        );
    }

    function removeBoxFromDb(shelf, boxId) {
        console.log('removing box...');
        let box_id = new ObjectID(boxId);

        let update = {
            "$pull": {
                boxes: {
                    _id: box_id
                }
            }
        };
        
        let query = {shelfLocation: shelf.shelfLocation};
        mongoClient.shelfCollection.update(query, update);
    }
}

export {removeBox};

// db.shelves.update({}, {"$pull": { "boxes": { "_id": ObjectId("573e3b6e0315bbec4a4ff2b9")}}});