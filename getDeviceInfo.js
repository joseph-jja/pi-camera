const {
    createWriteStream
} = require('fs'), {
    spawn
} = require('child_process');

const outStream = createWriteStream('/tmp/fmts.log');

const command = spawn('ffmpeg', ['-f', 'video4linux2', '-list_formats', 'all', '-i', '/dev/video0']);

command.stdout.pipe(outStream);
command.stderr.pipe(outStream);

