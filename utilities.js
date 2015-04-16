var fs = require( "fs" );

function safeUnlink( filename ) {
    if ( filename ) {
        // remove sent video
        // in a perfect world we would be we cant here :( 
        try {
            fs.unlink( filename, function ( err ) {
                if ( err ) {
                    console.log( err );
                }
            } );
        } catch ( e ) {
            console.log( "ERROR: + e" );
        }
    }
}

module.exports = {
    safeUnlink: safeUnlink
};
