var Gpio = require('onoff').Gpio,
  sensorPin = 16,
  fs = require('fs'),
  pir = new Gpio(sensorPin, 'in', 'both'), 
  mailer = require('./mailer'), 
  isRec = false;

// read the config for the node mailer from the fs
// we want sync here because it is starting up and don't want to mail anyway!
mail.setupTransport(JSON.parse(fs.readFileSync("config.json")));

pir.watch(function(err, value) {
  var exec, videoPath;
  if (err) {
    exit();
  }
  if (value == 1 && !isRec) {

    console.log('capturing video.. ');

    isRec = true;

    exec = require('child_process').exec;
    videoPath = '/tmp/video_' + Date.now() + '.h264';

    var cmd = 'raspivid -o ' + videoPath + ' -t 10000';
    exec(cmd, function(error, stdout, stderr) {
      // output is in stdout
      console.log('Video Saved @ : ', videoPath);
      mailer.sendEmail(videoPath);

      isRec = false;
    });

  }
});

console.log('Pi Bot deployed successfully!');
console.log('Guarding...');

function exit() {
  pir.unexport();
  process.exit();
}
