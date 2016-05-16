$(document).ready(function() {

    const clientSocket = io.connect('');

    clientSocket.on('res_data', function (data) {
        console.log(data);
    });

//    clientSocket.emit('remove_box');

    clientSocket.emit('get_all_shelves');

    clientSocket.on('response_get_all_shelves', function(shelfArray) {
        console.log(shelfArray);
    });


    $('.myForm').submit(function() {
        event.preventDefault();
        var $inputs = $('.myForm :input');
        console.log($inputs);

        var values = {};
        $inputs.each(function() {
            values[this.name] = $(this).val();
        });

        var noTemp = $('#notemp').prop('checked');
        var noLight = $('#nolight').prop('checked');

        if(noTemp) {
            values.minTemp = -200;
            values.maxTemp = 1000;
        }

        if(noLight) {
            values.minLight = 0;
            values.maxLight = 10000;
        }


        var box = {
            createdBy: 'john',
            boxName: values.boxname,
            prefTemp: {
                min: values.minTemp,
                max: values.maxTemp
            },
            prefLight: {
                min: values.minLight,
                max: values.maxLight
            },
            pendingStorage: true		// True when processed by the robot. When the robot is done, it is set to false
        }


        clientSocket.emit('add_box', (box));
    });

    clientSocket.on('res_data', function(data) {
       console.log(data);
    });

    clientSocket.on('add_box_status', function(shelf, box) {
        console.log('box', box);
        console.log('shelf', shelf);
        console.log('shelf_x', shelf.shelfLocation);
        console.log('shelf_y', shelf.boxes.length);
    });
});






