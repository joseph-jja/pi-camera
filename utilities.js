var fs = require( "fs" ),
    request = require( "request" ),
    winston = require( "winston" ),
    sunData = {
        "sunrise":"12:47:15 PM",
        "sunset":"3:33:44 AM", 
        "offset": 7
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
    var url, now = new Date(), offset;

    // offset in hours
    offset = now.getTimezoneOffset() / 60;

    // yyyymmdd
    dateString = today.getFullYear() + "";
    url = 'http://api.sunrise-sunset.org/json?lat=' + lat + '&lng=' + long + '&date=today';

    request( url, function ( req, res ) {
        var data, body = res.body;
        if ( body ) {
            data = JSON.parse( body );
            sunData.sunrise = data.results.sunrise;
            sunData.sunset = data.results.sunset;
            sunData.offset = offset;
        }
        callback( sunData );
    } );
}

function getDefaultSunriseSunset() {
    return sunData;
}

module.exports = {
    safeUnlink: safeUnlink,
    getSunriseSunset: getSunriseSunset,
    getDefaultSunriseSunset: getDefaultSunriseSunset
};
