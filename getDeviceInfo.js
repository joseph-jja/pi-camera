const {
    createWriteStream
} = require('fs'), {
    spawn
} = require('child_process');

// set to false if you don't have gst-device-monitor-1.0 from gstreamer1.0-plugins-base-apps
const USE_GST = true;

if (USE_GST) {

    const command = spawn('gst-device-monitor-1.0');
    const grep = spawn('grep', ['format']);
    const vgrep1 = spawn('grep', ['-v', '"\["']);
    const outStream = createWriteStream('/tmp/fmts.log');

    command.stdout.pipe(grep.stdin);
    command.stderr.pipe(grep.stdin);

    grep.stdout.pipe(vgrep1.stdin);
    grep.stderr.pipe(vgrep1.stdin);

    vgrep1.stdout.pipe(outStream);
    vgrep1.stderr.pipe(outStream);

} else {
    const command = spawn('ffmpeg', ['-f', 'video4linux2', '-list_formats', 'all', '-i', '/dev/video0']);
    const grep = spawn('grep', ['Raw']);
    const outStream = createWriteStream('/tmp/fmts.log');

    command.stdout.pipe(grep.stdin);
    command.stderr.pipe(grep.stdin);

    grep.stdout.pipe(outStream);
    grep.stderr.pipe(outStream);

}
