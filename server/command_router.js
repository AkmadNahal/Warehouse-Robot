import {sendRobotUpdateClient} from "./websocket-compiled";
import {changePendingStorage} from "./change_pending_storage-compiled"

function commandRouter(commandObject) {

    // insert
    // remove
    // move

    let command = commandObject.command;
    sendRobotUpdateClient(command, commandObject.id);
    
    switch (command) {

        case 'insert':
            console.log('robot has inserted a box!')
            console.log('The box that has been inserted: ' + commandObject.id);
            changePendingStorage(commandObject.id);
            // make insert websocket;
            break;
        case 'remove':
            console.log('robot has removed a box!');
            console.log('The box that has been removed: ' + commandObject.id);
            // remove
            break;
        case 'move':
            console.log('robot has moved!');
            break;
        case 'relocate':
            console.log(commandObject.id);
            changePendingStorage(commandObject.id);
            console.log('robot had relocated box!');
            break;

        default:
            console.log('swtich reached default, must be some error...');
    }

}

export {commandRouter};