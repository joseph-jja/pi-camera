const {
    spawn
} = require('child_process');

const FFMPEG = 'ffmpeg';

const DIRECT_STREAM_OPTS = '-i pipe: -an -filter_threads 1 -c:v copy -f mpjpeg -'.split(' ');

function getFfmpegStream() {
    return spawn(FFMPEG, DIRECT_STREAM_OPTS, {
        env: process.env
    });
}

function previewStream() {
    const spawnOptions = ['-i', 'pipe:', '-an', '-filter_threads', '1', '-s', '640x480', '-f', 'mpjpeg', '-'];
    return spawn(FFMPEG, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    getFfmpegStream,
    previewStream
};