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
                min: 13,
                max: 17
            },
            prefLight: {
                min: 0,
                max: 4000
            },
            pendingStorage: true		// True when processed by the robot. When the robot is done, it is set to false
        }

        clientSocket.emit('add_box', (box));
    });

    clientSocket.on('res_data', function(data) {
       console.log(data);
    });

    clientSocket.on('add_box_status', function(data) {
       console.log(data);
    });
});






