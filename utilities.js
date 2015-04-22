var fs = require( "fs" ),
    winston = require( "winston" );

function safeUnlink( filename ) {
    if ( filename ) {
        // remove sent video
        // in a perfect world we would be we cant here :( 
        try {
            fs.unlink( filename, function ( err ) {
                if ( err ) {
                    winston.log( "error", err );
                    return;
                }
                winston.log( "info", "Unlinked : " + filename );
            } );
        } catch ( e ) {
            winston.log( "error", "ERROR: + e" );
        }
    }
}

module.exports = {
    safeUnlink: safeUnlink
};
