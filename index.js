var Gpio = require('onoff').Gpio,
    sensorPin = 23,
    fs = require('fs'),
    pir = new Gpio(sensorPin, 'in', 'both'),
    Mailer = require('./mailer'),
    args, videoList = {},
    isRec = false,
    _ = require("underscore"),
    mailOptions, Sendmail,

    args = process.argv;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
mailOptions = JSON.parse(fs.readFileSync(args[2]));

Sendmail = new Mailer();

Sendmail.setupTransport(mailOptions.email.host, mailOptions.email.port, mailOptions.email.auth.user, mailOptions.email.auth.pass);

Sendmail.on("start", function(data) {
    videoList[data.filename] = {
        status: 'sending'
    };
});

Sendmail.on("end", function(data) {
    var x;
    if(data.error) {
        console.log("An error has occured: " + data.error);
    } else {
        // message has been sent
        console.log("Email status: " + info);
        // find next message to send
        for(x in videoList) {
            if(videList[x] && videoList[x].status === 'unsent') {
                Sendmail.sendEmail(mailOptions.user, videList[x]);
                break;
            }
        }
        videoList[data.filename] = undefined;
    }
});

function watchCB(err, value) {
    var cmd, exec, videoPath, mpegPath, timestamp;

    if(err) {
        exit();
    }

    if(value == 1 && !isRec) {

        console.log('capturing video.. ');

        isRec = true;

        timestamp = new Date();

        exec = require('child_process').exec;
        videoPath = '/tmp/video_' + timestamp.getDay() + "_" + timestamp.getHours() + '.h264';
        mpegPath = videoPath.replace('.h264', '.mpeg');

        // we don't want a preview, we want video 800x600 because we are emailing
        // we want exposure to auto for when it is dark 
        // fps we want low also for email
        cmd = 'raspivid -n --exposure auto -w 800 -h 600 -fps 15 -o ' + videoPath + ' -t 10000';
        exec(cmd, function(error, stdout, stderr) {
            // output is in stdout
            console.log('Video Saved @ : ', videoPath);
            // rename file to be named mpeg
            fs.rename(videoPath, mpegPath, function(err) {
                // no videos pending to be sent 
                if(_.isEmpty(videoList)) {
                    // mail first one
                    Sendmail.sendEmail(mailOptions.user, mpegPath);
                }
                videoList[mpegPath] = {
                    status: 'unsent'
                };
                isRec = false;
            });
        });
    }
}
pir.watch(watchCB);

console.log('Pi Bot deployed successfully!');
console.log('Guarding...');

function exit() {
    pir.unexport();
    process.exit();
}