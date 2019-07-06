var Gpio = require('onoff').Gpio,
    Mailer = require('./mailer'),
    baseDir = process.cwd(),
    logger = require(`${baseDir}/libs/logger`)(__filename),
    fs = require('fs'),
    Leds = require('./leds'),
    exec = require('child_process').exec,
    utilities = require('./utilities'),
    _ = require('underscore'),
    // constants
    sensorPin = 23,
    ledPin = 24,
    // module variables
    waitTime = 10000,
    pir,
    led,
    args,
    isRec = false,
    doSend = true,
    options,
    Sendmail,
    sunData,
    listener,
    messenger = require('messenger');

// command line arguments    
args = process.argv;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
options = JSON.parse(fs.readFileSync(args[2]));

pir = new Gpio(sensorPin, 'in', 'both');
led = new Leds((typeof options.useLight !== 'undefined' && options.useLight), ledPin);

const isSecure = options.email.secure || false;
const secure = {
    secure: isSecure
};

Sendmail = new Mailer();
Sendmail.setupTransport(options.email.host, options.email.port, options.email.auth.user, options.email.auth.pass, secure);

Sendmail.on('start', function(data) {
    logger.info('Sending ' + JSON.stringify(data));
});

Sendmail.on('end', function(data) {
    var fname;
    if (data.error) {
        logger.info('An error has occured: ' + data.error);
    } else if (data.info) {
        logger.info('Email status: ' + JSON.stringify(data.info));
    }
    if (data.filename) {
        // remove sent video
        // in a perfect world we would be we cant here :( 
        fname = data.filename;
        utilities.safeUnlink(fname);
    }
});

// lat long '37.772972', '-122.4431297'
sunData = utilities.getDefaultSunriseSunset();
sunData.sunriseHour = sunData.sunrise.substring(0, sunData.sunrise.indexOf(':'));
sunData.sunsetHour = sunData.sunset.substring(0, sunData.sunset.indexOf(':'));

function watchCB(err, value) {
    var cmd, ffmpegCmd, videoPathBase, videoPath, mpegPath, timestamp, nightMode;

    if (err) {
        logger.info(err);
        return;
    }

    logger.info('PIR state: ' + value);
    led.changeState(value);

    if (value === 1 && !isRec) {
        logger.info('capturing video.. ');

        isRec = true;

        timestamp = new Date();
        videPathBase = '/tmp/video_' + timestamp.getHours() + '_' + timestamp.getMinutes() + '_' + timestamp.getSeconds();
        videoPath = videPathBase + '.h264';
        mpegPath = videPathBase + '.mp4';

        // brightness  
        nightMode = '-br 60';
        if (timestamp.getHours() > 18 || timestamp.getHours() < 6) {
            nightMode = '-br 70';
        }

        // we don't want a preview, we want video 800x600 because we are emailing
        // we want exposure to auto for when it is dark 
        // fps we want low also for email
        cmd = 'raspivid -n -ISO 800 --exposure auto ' + nightMode + ' -w 800 -h 600 -fps 20 -o ' + videoPath + ' -t ' + waitTime;
        ffmpegCmd = 'avconv -r 20 -i ' + videoPath + ' -r 15 ' + mpegPath;
        logger.debug('Video record command: ' + cmd);
        logger.debug('Video convert command: ' + ffmpegCmd);
        exec(cmd, function(error, stdout, stderr) {
            // turn recording flag off ASAP
            isRec = false;
            // output is in stdout
            logger.debug('Video saved: ', videoPath);
            // convert video to be smaller
            exec(ffmpegCmd, function(error, stdout, stderr) {
                // send the video
                if (doSend) {
                    Sendmail.sendEmail(options.user, mpegPath);
                } else {
                    utilities.safeUnlink(mpegPath);
                }
                // unlink the video now that it is converted
                utilities.safeUnlink(videoPath);
            });
        });
    }
}
pir.watch(watchCB);

listener = messenger.createListener(options.listenPort);
listener.on(options.listenMessage, function(m, data) {
    var response = {};
    if (data.changeMode === options.changeModeKey) {
        doSend = !doSend;
    }
    logger.debug(data.changeMode + ' ' + doSend);
    logger.info('Current mode of notification ' + doSend);
    // always reply with status
    response[options.replyMessage] = doSend;
    m.reply(response);
});

logger.info('Pi Bot deployed successfully!');
logger.info('Guarding...');

process.on('SIGINT', exit);

function exit(code) {

    if (code) {
        logger.info('Exiting on code: ' + code);
    }
    pir.unexport();
    led.cleanup();

    process.exit();
}