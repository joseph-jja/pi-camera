const {
    createWriteStream
} = require('fs'), {
    spawn
} = require('child_process');

const basedir = process.cwd(),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`);

function errorHandler(e) {
    logger.error(e);
    return Promise.resolve();
}

let hasRun = false;

async function getGSTCommand() {

    if (hasRun) {
        return true;
    }

    const gst = await whichCommand('gst-device-monitor-1.0').catch(errorHandler);
    if (gst) {
        const command = spawn('gst-device-monitor-1.0');
        const grep = spawn('grep', ['format']);
        const vgrep1 = spawn('grep', ['-v', 'v4l2_videodevice']);
        const outStream = createWriteStream('/tmp/fmts.log');

        command.stdout.pipe(grep.stdin);
        command.stderr.pipe(grep.stdin);

        grep.stdout.pipe(vgrep1.stdin);
        grep.stderr.pipe(vgrep1.stdin);

        vgrep1.stdout.pipe(outStream);
        vgrep1.stderr.pipe(outStream);

        outStream.once('finish', () => {
            hasRun = true;
            return Promise.resolve({
                type: 'gst',
                data: '/tmp/fmts.log'
            });
        });

    } else {
        const ffmpeg = await whichCommand('ffmpeg').catch(errorHandler);
        if (ffmpeg) {
            const command = spawn('ffmpeg', ['-f', 'video4linux2', '-list_formats', 'all', '-i', '/dev/video0']);
            const grep = spawn('grep', ['Raw']);
            const outStream = createWriteStream('/tmp/fmts.log');

            command.stdout.pipe(grep.stdin);
            command.stderr.pipe(grep.stdin);

            grep.stdout.pipe(outStream);
            grep.stderr.pipe(outStream);

            outStream.once('finish', () => {
                hasRun = true;
                return Promise.resolve({
                    type: 'ffmpeg',
                    data: '/tmp/fmts.log'
                });
            });

        } else {
            logger.error(`Install gst-device-monitor-1.0 to get video modes`);
            Promise.reject({
                type: 'none',
                data: null
            })
        }
    }
}

module.exports = getGSTCommand;
