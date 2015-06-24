var client,
    config,
    messenger = require( "messenger" );

config = JSON.parse( fs.readFileSync( args[ 2 ] ) );

client = messenger.createSpeaker( config.listenerPort );
setTimout( function () {
    client.send( config.listenerMessage, {
        changeMode: 'please'
    } );
}, 0 );
