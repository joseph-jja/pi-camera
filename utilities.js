var fs = require( "fs" ),
    request = require("request"),
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

// cm signature function (error, response, body) 
function getSunriseSunset(lat, long, cb) {
    var url, today = new Date(), dateString;
    
    // yyyymmdd
    dateString = today.getFullYear() + "" ;
    url = 'http://api.sunrise-sunset.org/json?'lat=' + lat + '&lng=' + long + '&date=' + dateString;
    
    request(url, cb);
}

module.exports = {
    safeUnlink: safeUnlink, 
    getSunriseSunset: getSunriseSunset
};
