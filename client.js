var client,
    fs = require( "fs" ),
    config, args,
    messenger = require( "messenger" );

// get args and read config 
args = process.argv;
config = JSON.parse( fs.readFileSync( args[ 2 ] ) );

client = messenger.createSpeaker( config.listenPort );
setTimeout( function () {
    client.send( config.listenMessage, {
        changeMode: 'please'
    }, function () {
        console.log( "Done! " + JSON.stringify( arguments ) );
        // client does not exit :(
        process.abort();
    } );
}, 2000 );
