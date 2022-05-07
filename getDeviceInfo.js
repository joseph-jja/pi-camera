const {
    createWriteStream
} = require('fs'), {
    spawn
} = require('child_process');

const outStream = createWriteStream('/tmp/fmts.log');

const command = spawn('ffmpeg', ['-f', 'video4linux2', '-list_formats', 'all', '-i', '/dev/video0']);
const grep = spawn('grep', ['Raw']);

command.stdout.pipe(grep);
command.stderr.pipe(grep);

grep.stdout.pipe(outStream);
grep.stderr.pipe(outStream);

