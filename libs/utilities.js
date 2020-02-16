const fs = require('fs'),
    baseDir = process.cwd(),
    httpGet = require(`${baseDir}/libs/httpGet`),
    logger = require(`${baseDir}/libs/logger`)(__filename);

let sunData = {
    'sunrise': '5:47:15 AM',
    'sunset': '7:33:44 PM'
};

const API_HOST = 'api.sunrise-sunset.org',
    API_PATH = (lat, lng) => {
        return '/json?lat=' + lat + '&lng=' + lng + '&date=today';
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
                logger.info('Unlinked : ' + filename);
            });
        } catch (e) {
            logger.error('ERROR: ' + e);
        }
    }
}

// cm signature function (error, response, body) 
// callback get sunData argument
function getSunriseSunset(lat, lng, gmtOffset, callback) {

    let url,
        now = new Date(),
        offset = gmtOffset || 4;

    // yyyymmdd
    urlPath = API_PATH(lat, lng);

    httpGet(API_HOST, urlPath)
        .then(body => {
            const data = JSON.parse(body);
            let up = data.results.sunrise;
            let down = data.results.sunset;

            sunData = {
                sunrise: up,
                sunset: down
            };

            up = up.substring(0, up.indexOf(':'));
            down = down.substring(0, down.indexOf(':'));

            // for us we are - 7ish hours YMMV
            // setup sunrise
            now.setHours(up - offset);
            up = now.getHours() + sunData.sunrise.substring(sunData.sunrise.indexOf(':'));

            // setup sunset
            now.setHours(down - offset);
            down = now.getHours() + sunData.sunset.substring(sunData.sunset.indexOf(":"));

            sunData.sunrise = up.replace('PM', 'AM');
            sunData.sunset = down.replace('AM', 'PM');

            callback(sunData);

        }).catch(e => {
            console.error(e);
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
