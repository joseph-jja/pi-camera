const fs = require('fs'),
    exec = require('child_process').exec,
    Gpio = require('onoff').Gpio,
    messenger = require('messenger'),
    baseDir = __dirname,
    logger = require(`${baseDir}/libs/logger`)(__filename),
    Mailer = require(`${baseDir}/libs/mailer`),
    Leds = require(`${baseDir}/leds`),
    utilities = require(`${baseDir}/libs/utilities`);

// constants
const sensorPin = 23,
    ledPin = 24,
    // module variables
    waitTime = 10000;

let isRec = false,
    doSend = true;

// command line arguments
let args = process.argv;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
let options = JSON.parse(fs.readFileSync(args[2]).toString());

let pir = new Gpio(sensorPin, 'in', 'both');
let led = new Leds((typeof options.useLight !== 'undefined' && options.useLight), ledPin);

const Sendmail = new Mailer();
Sendmail.setupTransport(options.email.host, options.email.port, options.email.auth.user, options.email.auth.pass, options.secure);

Sendmail.on('start', function (data) {
    logger.info('Sending ' + JSON.stringify(data));
});

Sendmail.on('end', function (data) {
    if (data.error) {
        logger.info('An error has occured: ' + data.error);
    } else if (data.info) {
        logger.info('Email status: ' + JSON.stringify(data.info));
    }
    if (data.filename) {
        // remove sent video
        // in a perfect world we would be we cant here :(
        const fname = data.filename;
        utilities.safeUnlink(fname);
    }
});

// lat long '37.772972', '-122.4431297'
const sunData = utilities.getDefaultSunriseSunset();
sunData.sunriseHour = sunData.sunrise.substring(0, sunData.sunrise.indexOf(':'));
sunData.sunsetHour = sunData.sunset.substring(0, sunData.sunset.indexOf(':'));

function watchCB(err, value) {

    if (err) {
        logger.info(err);
        return;
    }

    logger.info('PIR state: ' + value);
    led.changeState(value);

    if (value === 1 && !isRec) {
        logger.info('capturing video.. ');

        isRec = true;

        const timestamp = new Date();
        const videPathBase = '/tmp/video_' + timestamp.getHours() + '_' + timestamp.getMinutes() + '_' + timestamp.getSeconds();
        const videoPath = videPathBase + '.h264';
        const mpegPath = videPathBase + '.mp4';

        // brightness
        let nightMode = '-br 60';
        if (timestamp.getHours() > 18 || timestamp.getHours() < 6) {
            nightMode = '-br 70';
        }

        // we don't want a preview, we want video 800x600 because we are emailing
        // we want exposure to auto for when it is dark
        // fps we want low also for email
        const cmd = 'raspivid -n -ISO 800 --exposure auto ' + nightMode + ' -w 800 -h 600 -fps 20 -o ' + videoPath + ' -t ' + waitTime;
        const ffmpegCmd = 'avconv -r 20 -i ' + videoPath + ' -r 15 ' + mpegPath;
        logger.debug('Video record command: ' + cmd);
        logger.debug('Video convert command: ' + ffmpegCmd);
        exec(cmd, function (errorA, stdoutA, stderrA) {
            if (stderrA) {
                logger.error(JSON.stringify(stderrA));
            } else if (errorA) {
                logger.error(JSON.stringify(errorA));
            }
            // turn recording flag off ASAP
            isRec = false;
            // output is in stdout
            logger.debug('Video saved: ', videoPath);
            // convert video to be smaller
            exec(ffmpegCmd, function (errorB, stdoutB, stderrB) {
                if (stderrB) {
                    logger.error(JSON.stringify(stderrB));
                } else if (errorB) {
                    logger.error(JSON.stringify(errorB));
                }
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

const listener = messenger.createListener(options.listenPort);
listener.on(options.listenMessage, function (m, data) {
    var response = {};
    if (data.changeMode === options.changeModeKey) {
        doSend = !doSend;
    }
    logger.debug(data.changeMode + ' ' + doSend);
    //logger.info('Current mode of notification ' + doSend);
    logger.info('Current mode of notification --- ');
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
