const {
    spawn
} = require('child_process');

const FFMPEG = 'ffmpeg';

const DIRECT_STREAM_OPTS = '-i pipe: -an -filter_threads 1 -c:v copy -f mpjpeg -'.split(' '),
    PREVIEW_STREAM_OPTS = ['-i', 'pipe:', '-an', '-filter_threads', '1', '-codec', 'copy', '-s', '640x480', '-f', 'mpjpeg', '-'];

function getFfmpegStream() {
    return spawn(FFMPEG, DIRECT_STREAM_OPTS, {
        env: process.env
    });
}

function previewStream() {
    return spawn(FFMPEG, PREVIEW_STREAM_OPTS, {
        env: process.env
    });
}

module.exports = {
    getFfmpegStream,
    previewStream
};
