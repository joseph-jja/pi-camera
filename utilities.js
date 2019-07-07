const fs = require("fs"),
    baseDir = __dirname,
    request = require("request"),
    logger = require(`${baseDir}/libs/logger`)(__filename),
    sunData = {
        "sunrise": "5:47:15 AM",
        "sunset": "7:33:44 PM"
    };

function safeUnlink(filename) {
    if (filename) {
        // remove sent video
        // in a perfect world we would be we cant here :( 
        try {
            fs.unlink(filename, function(err) {
                if (err) {
                    logger.error(err);
                    return;
                }
                logger.info("Unlinked : " + filename);
            });
        } catch (e) {
            logger.error("ERROR: + e");
        }
    }
}

// cm signature function (error, response, body) 
// callback get sunData argument
function getSunriseSunset(lat, long, callback) {
    var url, now = new Date(),
        offset = 7;

    // offset in hours
    offset = now.getTimezoneOffset() / 60;

    // yyyymmdd
    url = 'http://api.sunrise-sunset.org/json?lat=' + lat + '&lng=' + long + '&date=today';

    request(url, function(req, res) {
        var data, body = res.body,
            up, down;
        if (body) {
            data = JSON.parse(body);
            up = data.results.sunrise;
            down = data.results.sunset;
            sunData.sunrise = up;
            sunData.sunset = down;
            up = up.substring(0, up.indexOf(":"));
            down = down.substring(0, down.indexOf(":"));

            // for us we are - 7ish hours YMMV
            // setup sunrise
            now.setHours(up - offset);
            up = now.getHours() + sunData.sunrise.substring(sunData.sunrise.indexOf(":"));

            // setup sunset
            now.setHours(down - offset);
            down = now.getHours() + sunData.sunset.substring(sunData.sunset.indexOf(":"));

            sunData.sunrise = up.replace("PM", "AM");
            sunData.sunset = down.replace("AM", "PM");;
        }
        callback(sunData);
    });
}

function getDefaultSunriseSunset() {
    return sunData;
}

module.exports = {
    safeUnlink: safeUnlink,
    getSunriseSunset: getSunriseSunset,
    getDefaultSunriseSunset: getDefaultSunriseSunset
};