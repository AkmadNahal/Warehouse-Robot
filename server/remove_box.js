import { mongoClient } from './mongodb-compiled';
import {ObjectID} from "./mongodb-compiled";
import {sendCommandServer} from "./send_command_server-compiled";

function removeBox(oldShelfLocation, boxId, callback) {

    console.log('called removebox');


    // findone shelf
    // remove boxId
    // sendCommand
    // send signal client


    findShelf(boxId, function (shelf) {
        let theShelf = shelf;
        removeBoxFromDb(theShelf, boxId);
        if(!oldShelfLocation) {
            sendCommandServer(false,'remove',boxId, theShelf.shelfLocation, theShelf.yPos+1);
        }
        callback(boxId, true);
    });

    //        let query = { "boxes": { "$elemMatch": { "_id": "ObjectId(" + "'boxId' + ")" } } };


    function findShelf(boxId, callback) {
        console.log('called findshelf');
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
                console.log('got back from shelf query');

                for(let i = 0; i < res.boxes.length; i++) {
                    console.log(res.boxes[i]._id);
                    console.log(boxId);
                    console.log(res.boxes[i]._id == boxId);
                    if( String(res.boxes[i]._id) === String(boxId)) {
                        console.log('found a match for boxes id')
                        console.log(res.boxes[i]._id);
                        console.log(boxId);
                        res.yPos = i;
                        callback(res);
                    }
                }
            }
        );
    }

    function removeBoxFromDb(shelf, boxId) {
        console.log('called removeBoxdb');
        console.log(shelf);
        console.log(boxId);


        let box_id = new ObjectID(boxId);
        /*
         let update = { "$pull": { boxes: { _id: box_id } } };

         let query = {shelfLocation: shelf.shelfLocation};
         mongoClient.shelfCollection.update(query, update);
         */
        mongoClient.shelfCollection.update({"shelfLocation": shelf.shelfLocation, "boxes._id": box_id}, { $set: { "boxes.$": '' } });

    }
}

export {removeBox};

// db.shelves.update({}, {"$pull": { "boxes": { "_id": ObjectId("574576137a7af22b7d9ae902")}}});

//mongoClient.shelfCollection.update({"_id": 1, "boxes": ObjectId("574576137a7af22b7d9ae902")}, { $set: { "boxes.$": '' } });
