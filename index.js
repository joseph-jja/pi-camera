var Gpio = require('onoff').Gpio,
  sensorPin = 16,
  fs = require('fs'),
  pir = new Gpio(sensorPin, 'in', 'both'), 
  mailer = require('./mailer'), 
  isRec = false, 
  mailOptions;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
mailOptions = JSON.parse(fs.readFileSync("config.json"));

mail.setupTransport(mailOption.email);

pir.watch(function(err, value) {
  var cmd, exec, 
    videoPath, mpegPath
    timestamp;
  if (err) {
    exit();
  }
  if (value == 1 && !isRec) {

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
        mailer.sendEmail(mailOptions.user, mpegPath);
        isRec = false;
      });
    });

  }
});

console.log('Pi Bot deployed successfully!');
console.log('Guarding...');

function exit() {
  pir.unexport();
  process.exit();
}
