var client,
    fs = require( "fs" ),
    config, args,
    messenger = require( "messenger" );

// get args and read config 
args = process.argv;
config = JSON.parse( fs.readFileSync( args[ 2 ] ) );

client = messenger.createSpeaker( config.listenPort );
//#setTimout( function () {
    client.send( config.listenerMessage, {
        changeMode: 'please'
    } );
//}, 0 );
