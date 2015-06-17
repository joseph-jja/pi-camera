var fs = require( "fs" ),
    request = require( "request" ),
    winston = require( "winston" ),
    sunData = {
        "sunrise": "8:27:55 PM",
        "sunset": "11:14:31 AM"
    };

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
// callback get sunData argument
function getSunriseSunset( lat, long, callback ) {
    var url, today = new Date(),
        dateString;

    // yyyymmdd
    dateString = today.getFullYear() + "";
    url = 'http://api.sunrise-sunset.org/json?lat=' + lat + '&lng=' + long + '&date=' + dateString;

    request( url, function ( req, res ) {
        var data, body = res.body;
        if ( body ) {
            data = JSON.parse( body );
            sunData.sunrise = data.results.sunrise;
            sunData.sunset = data.results.sunset;
        }
        callback( sunData );
    } );
}

module.exports = {
    safeUnlink: safeUnlink,
    getSunriseSunset: getSunriseSunset
};
