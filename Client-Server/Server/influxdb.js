export let dbClient;
function influxDbSetup() {

    const influx = require('influx');

    
    dbClient = influx({

        host: 'localhost',
        port: 8086, // optional. default 8086
        protocol: 'http', //optional. default 'http'
        database: 'arduino_sensors'
    });
    
}

export { influxDbSetup, dbClient};