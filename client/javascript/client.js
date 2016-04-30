$(document).ready(function() {
    const clientSocket = io.connect('');

    clientSocket.on('res_data', function (data) {
        console.log(data);
    })
});




