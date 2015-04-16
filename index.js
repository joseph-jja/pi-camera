var Gpio = require( 'onoff' ).Gpio,
    Mailer = require( './mailer' ),
    fs = require( 'fs' ),
    Leds = require( "./leds" ),
    utilities = require( "./utilities" ),
    _ = require( "underscore" ),
    // constants
    sensorPin = 23,
    ledPin = 24,
    // module variables
    pir,
    led,
    args,
    videoList = {},
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

Sendmail.waitTime = 5000;

Sendmail.setupTransport( options.email.host, options.email.port, options.email.auth.user, options.email.auth.pass );

Sendmail.on( "start", function ( data ) {
    videoList[ data.filename ] = {
        status: 'sending'
    };
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
            videoList[ data.filename ] = undefined;
        }

        // find next message to send
        for ( x in videoList ) {
            if ( videoList[ x ] && videoList[ x ].status === 'unsent' ) {
                Sendmail.sendEmail( options.user, videoList[ x ].filename );
                break;
            }
        }
    }
} );

function watchCB( err, value ) {
    var cmd, exec, videoPath, mpegPath, timestamp;

    if ( err ) {
        exit();
    }

    console.log( 'PIR state: ' + value );
    led.changeState( value );

    if ( value === 1 && !isRec ) {
        console.log( 'capturing video.. ' );

        isRec = true;

        timestamp = new Date();

        exec = require( 'child_process' ).exec;
        videoPath = '/tmp/video_' + timestamp.getHours() + "_" + timestamp.getMinutes() + "_" + timestamp.getSeconds() + '.h264';
        mpegPath = videoPath.replace( '.h264', '.mpeg' );

        // we don't want a preview, we want video 800x600 because we are emailing
        // we want exposure to auto for when it is dark 
        // fps we want low also for email
        cmd = 'raspivid -n --exposure auto -w 800 -h 600 -fps 15 -o ' + videoPath + ' -t ' + Sendmail.waitTime;
        console.log( "Video command: " + cmd );
        exec( cmd, function ( error, stdout, stderr ) {
            // output is in stdout
            console.log( 'Video saved: ', videoPath );
            // rename file to be named mpeg
            fs.rename( videoPath, mpegPath, function ( err ) {
                // no videos pending to be sent 
                if ( _.isEmpty( videoList ) ) {
                    // mail first one
                    Sendmail.sendEmail( options.user, mpegPath );
                }
                videoList[ mpegPath ] = {
                    filename: mpegPath,
                    status: 'unsent'
                };
                isRec = false;
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
