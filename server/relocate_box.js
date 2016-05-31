import {tryInsertBox} from "./add_box-compiled";
import {sendCommandServer} from "./send_command_server-compiled";
import {removeBox} from "./remove_box-compiled";
import {clearCountBox} from "./self_org-compiled";
import {sendRobotUpdateClient} from "./websocket-compiled";


function relocateBox(box, shelfLocation, locationInShelf) {
    console.log('relocate called!');

    tryInsertBox(box, shelfLocation, (newShelf, NewBox, y_coordinate) => {

        if(newShelf == 'Failed to find a shelf') {
            console.log('failed to relocate!!!');
            console.log(box);
            clearCountBox(box._id);
        } else {
            let x_coordinates = '' + shelfLocation + ' ' + newShelf.shelfLocation;
            let y_coordinates = '' + locationInShelf + ' ' + y_coordinate;

            console.log('sending command to gateway');
            console.log(x_coordinates);
            console.log(y_coordinates);

            let relocateObject = {
                box,
                oldLocation: {
                    x: shelfLocation,
                    y: locationInShelf,
                },
                newLocation: {
                    x: newShelf.shelfLocation,
                    y: y_coordinate
                }
            }

            sendRobotUpdateClient('relocate_in_progress', relocateObject);
            sendCommandServer(false,'relocate', NewBox._id, x_coordinates, y_coordinates);
        }

    });


}

export {relocateBox};