var Gpio = require( 'onoff' ).Gpio,
    Mailer = require( './mailer' ),
    winston = require( 'winston' ),
    fs = require( 'fs' ),
    Leds = require( "./leds" ),
    exec = require( 'child_process' ).exec,
    utilities = require( "./utilities" ),
    _ = require( "underscore" ),
    // constants
    sensorPin = 23,
    ledPin = 24,
    // module variables
    waitTime = 7000,
    pir,
    led,
    args,
    isRec = false,
    options,
    Sendmail,
    sunData;

// command line arguments    
args = process.argv;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
options = JSON.parse( fs.readFileSync( args[ 2 ] ) );

pir = new Gpio( sensorPin, 'in', 'both' );
led = new Leds( ( typeof options.useLight !== 'undefined' && options.useLight ), ledPin );

Sendmail = new Mailer();

Sendmail.setupTransport( options.email.host, options.email.port, options.email.auth.user, options.email.auth.pass );

Sendmail.on( "start", function ( data ) {
    winston.log( "info", "Sending " + JSON.stringify( data ) );
} );

Sendmail.on( "end", function ( data ) {
    var fname;
    if ( data.error ) {
        winston.log( "info", "An error has occured: " + data.error );
    } else if ( data.info ) {
        winston.log( "info", "Email status: " + JSON.stringify( data.info ) );
    }
    if ( data.filename ) {
        // remove sent video
        // in a perfect world we would be we cant here :( 
        fname = data.filename;
        utilities.safeUnlink( fname );
    }
} );

// lat long "37.772972", "-122.4431297"
sunData = utilities.getDefaultSunriseSunset();
sunData.sunriseHour = sunData.sunrise.substring( 0, sunData.sunrise.indexOf( ":" ) );
sunData.sunsetHour = sunData.sunset.substring( 0, sunData.sunset.indexOf( ":" ) );

function watchCB( err, value ) {
    var cmd, ffmpegCmd, videoPathBase, videoPath, mpegPath, timestamp, nightMode;

    if ( err ) {
        exit();
    }

    winston.log( "info", 'PIR state: ' + value );
    led.changeState( value );

    if ( value === 1 && !isRec ) {
        winston.log( "info", 'capturing video.. ' );

        isRec = true;

        timestamp = new Date();
        videPathBase = '/tmp/video_' + timestamp.getHours() + "_" + timestamp.getMinutes() + "_" + timestamp.getSeconds();
        videoPath = videPathBase + '.h264';
        mpegPath = videPathBase + '.mp4';

        // brightness  
        nightMode = '-br 60';
        if ( timestamp.getHours() > 18 || timestamp.getHours() < 6 ) {
            nightMode = '-br 70';
        }

        // we don't want a preview, we want video 800x600 because we are emailing
        // we want exposure to auto for when it is dark 
        // fps we want low also for email
        cmd = 'raspivid -n -ISO 800 --exposure auto ' + nightMode + ' -w 800 -h 600 -fps 20 -o ' + videoPath + ' -t ' + waitTime;
        ffmpegCmd = 'avconv -r 20 -i ' + videoPath + ' -r 15 ' + mpegPath;
        winston.log( "info", "Video command: " + cmd );
        exec( cmd, function ( error, stdout, stderr ) {
            // turn recording flag off ASAP
            isRec = false;
            // output is in stdout
            winston.log( "info", 'Video saved: ', videoPath );
            // convert video to be smaller
            exec( ffmpegCmd, function ( error, stdout, stderr ) {
                winston.log( "info", "Video converted: " + ffmpegCmd );
                // send the video
                Sendmail.sendEmail( options.user, mpegPath );
                // unlink the video now that it is converted
                utilities.safeUnlink( videoPath );
            } );
        } );
    }
}
pir.watch( watchCB );

winston.log( "info", 'Pi Bot deployed successfully!' );
winston.log( "info", 'Guarding...' );

process.on( 'SIGINT', exit );

function exit( code ) {

    if ( code ) {
        winston.log( "info", "Exiting on code: " + code );
    }
    pir.unexport();
    led.cleanup();

    process.exit();
}
