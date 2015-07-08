var client,
    fs = require( "fs" ),
    config, args,
    msg = {
        changeMode: "status"
    },
    messenger = require( "messenger" );

// get args and read config 
args = process.argv;
config = JSON.parse( fs.readFileSync( args[ 2 ] ) );

client = messenger.createSpeaker( config.listenPort );

if ( args[ 3 ] ) {
    msg = {
        changeMode: config.changeModeKey
    };
}
setTimeout( function () {
    client.send( config.listenMessage, msg, function ( resp ) {
        console.log( "Done! " + JSON.stringify( resp ) );
        // client does not exit :(
        process.exit( 0 );
    } );
}, 2000 );
