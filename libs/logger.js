const path = require( 'path' ),
    winston = require( 'winston' );

const baseDir = process.cwd();

const {
    getEnvVar
} = require( `${baseDir}/libs/env` );

const LOG_LEVEL = getEnvVar( 'LOG_LEVEL', 'info' );

const MONTH_SHORT_NAMES = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
    WEEKDAY_SHORT_NAMES = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

function printTimestamp() {
    const now = new Date();

    let hours = now.getHours(),
        ampm = 'am';
    if ( hours === 0 ) {
        hours = 12;
        ampm = 'am';
    } else if ( hours > 12 ) {
        hours = hours - 12;
        ampm = 'pm';
    }

    const minutes = now.getMinutes(),
        seconds = now.getSeconds(),
        milli = now.getMilliseconds();

    const weekday = WEEKDAY_SHORT_NAMES[ now.getDay() ],
        month = MONTH_SHORT_NAMES[ now.getMonth() ];

    return `${weekday} ${month} ${now.getDate()} ${now.getFullYear()} ${hours}:${minutes}:${seconds},${milli} ${ampm}`;
}

function createLogger( filename ) {
    const logFormat = winston.format.combine(
        winston.format.splat(),
        winston.format.printf( info => {
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
        } )
    );

    // TODO handle errors?
    const Logger = winston.createLogger( {
        level: LOG_LEVEL,
        exitOnError: false,
        emitErrs: false,
        transports: [
            new winston.transports.Console( {
                format: logFormat
            } )
        ]
    } );
    return Logger;
}

module.exports = createLogger;
