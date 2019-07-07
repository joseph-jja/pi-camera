const path = require('path'),
    winston = require('winston');

const baseDir = __dirname;

const {
    getEnvVar
} = require(`${baseDir}/env`);

const LOG_LEVEL = getEnvVar('LOG_LEVEL', 'info');

const MONTH_SHORT_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    WEEKDAY_SHORT_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function printTimestamp() {
    const now = new Date();

    // get hours and convert to string
    let hours = now.getHours(),
        ampm = 'am';
    if (hours === 0) {
        hours = '12';
        ampm = 'am';
    } else if (hours > 12) {
        hours = `${hours - 12}`;
        ampm = 'pm';
    } else {
        hours = `${hours}`;
    }

    hours = hours.padStart(2, '0');

    const minutes = `${now.getMinutes()}`.padStart(2, '0'),
        seconds = `${now.getSeconds()}`.padStart(2, '0'),
        milli = `${now.getMilliseconds()}`.padStart(3, '0');

    const weekday = WEEKDAY_SHORT_NAMES[now.getDay()],
        month = MONTH_SHORT_NAMES[now.getMonth()];

    return `${weekday} ${month} ${now.getDate()} ${now.getFullYear()} ${hours}:${minutes}:${seconds},${milli} ${ampm}`;
}

function createLogger(filename) {
    const logFormat = winston.format.combine(
        winston.format.splat(),
        winston.format.printf(info => {
            return `
    $ {
        printTimestamp()
    } - $ {
        path.basename( filename )
    } - $ {
        info.level
    }: $ {
        info.message
    }
    `;
        })
    );

    // TODO handle errors?
    const Logger = winston.createLogger({
        level: LOG_LEVEL,
        exitOnError: false,
        emitErrs: false,
        transports: [
            new winston.transports.Console({
                format: logFormat
            })
        ]
    });
    return Logger;
}

module.exports = createLogger;
