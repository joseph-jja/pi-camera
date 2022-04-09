const { spawn } = require('child_process');

const FFMPEG = 'ffmpeg';

const DIRECT_STREAM_OPTS = '-i pipe: -an -filter_threads 1 -c:v copy -f mpjpeg -'.split(' ');

function getFfmpegStream() {
    return spawn(FFMPEG, DIRECT_STREAM_OPTS);
}



module.exports = {
    getFfmpegStream
};
