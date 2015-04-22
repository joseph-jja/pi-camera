var Gpio = require( 'onoff' ).Gpio,
    Mailer = require( './mailer' ),
    fs = require( 'fs' ),
    Leds = require( "./leds" ),
    exec = require( 'child_process' ).exec,
    utilities = require( "./utilities" ),
    _ = require( "underscore" ),
    // constants
    sensorPin = 23,
    ledPin = 24,
    // module variables
    waitTime = 10000,
    pir,
    led,
    args,
    isRec = false,
    options,
    Sendmail;

// command line arguments    
args = process.argv;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
options = JSON.parse( fs.readFileSync( args[ 2 ] ) );

pir = new Gpio( sensorPin, 'in', 'both' );
led = new Leds( ( typeof options.useLight !== 'undefined' ), ledPin );

Sendmail = new Mailer();

Sendmail.setupTransport( options.email.host, options.email.port, options.email.auth.user, options.email.auth.pass );

Sendmail.on( "start", function ( data ) {
    console.log( "Sending " + JSON.stringify( data ) );
} );

Sendmail.on( "end", function ( data ) {
    var x, fname;
    if ( data.error ) {
        console.log( "An error has occured: " + data.error );
    } else {
        // message has been sent
        if ( data.info ) {
            console.log( "Email status: " + JSON.stringify( data.info ) );
        }

        if ( data.filename ) {
            // remove sent video
            // in a perfect world we would be we cant here :( 
            fname = data.filename;
            utilities.safeUnlink( fname );
        }
    }
} );

function watchCB( err, value ) {
    var cmd, ffmpegCmd, videoPath, mpegPath, timestamp;

    if ( err ) {
        exit();
    }

    console.log( 'PIR state: ' + value );
    led.changeState( value );

    if ( value === 1 && !isRec ) {
        console.log( 'capturing video.. ' );

        isRec = true;

        timestamp = new Date();

        videoPath = '/tmp/video_' + timestamp.getHours() + "_" + timestamp.getMinutes() + "_" + timestamp.getSeconds() + '.h264';
        mpegPath = videoPath.replace( '.h264', '.mp4' );

        // we don't want a preview, we want video 800x600 because we are emailing
        // we want exposure to auto for when it is dark 
        // fps we want low also for email
        cmd = 'raspivid -n --exposure auto -w 800 -h 600 -fps 20 -o ' + videoPath + ' -t ' + waitTime;
        ffmpegCmd = 'ffmpeg -r 20 -i ' + videoPath + ' ' + mpegPath;
        console.log( "Video command: " + cmd );
        exec( cmd, function ( error, stdout, stderr ) {
            // output is in stdout
            console.log( 'Video saved: ', videoPath );
            // convert video to be smaller
            exec( ffmpegCmd, function ( error, stdout, stderr ) {
                // send the video
                Sendmail.sendEmail( options.user, mpegPath );
                isRec = false;
                utilities.safeUnlink( videoPath );
            } );
        } );
    }
}
pir.watch( watchCB );

console.log( 'Pi Bot deployed successfully!' );
console.log( 'Guarding...' );

process.on( 'SIGINT', exit );

function exit( code ) {

    if ( code ) {
        console.log( "Exiting on code: " + code );
    }
    pir.unexport();
    led.cleanup();

    process.exit();
}
