$(document).ready(function() {
    const clientSocket = io.connect('');

    clientSocket.on('res_data', function (data) {
        console.log(data);
    });

    $('#add_box').on('submit', function (event) {
        event.preventDefault();
        var box = {
            createdBy: 'john',
            prefTemp: {
                max: 20,
                min: 14
            },
            prefLight: {
                max: 4000,
                min: 0
            },
            pendingStorage: true		// True when processed by the robot. When the robot is done, it is set to false
        }

        clientSocket.emit('add_box', (box));
    });

    clientSocket.on('res_data', function(data) {
       console.log(data);
    });

    clientSocket.on('insert_failed', function() {
        console.log('insert failed');
    });

    clientSocket.on('insert_succeeded', function(data) {
        console.log('insert succeeded');
        console.log(data);
    });
});






