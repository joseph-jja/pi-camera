const {
    spawn
} = require('child_process');

const FFMPEG = 'ffmpeg';

const DIRECT_STREAM_OPTS = ['-i', 'pipe:', '-an', '-filter_threads', '1', '-r', '4', '-s', '640x480', '-f', 'mpjpeg', '-'];

const defaultFramerateIndex = DIRECT_STREAM_OPTS.indexOf('-r') + 1;

function getFfmpegStream(framerate = 4) {
    DIRECT_STREAM_OPTS[defaultFramerateIndex] = framerate;
    return spawn(FFMPEG, DIRECT_STREAM_OPTS, {
        env: process.env
    });
}

function playFile(filename, config) {

    // framerate
    const index = config.indexOf['--framerate'];
    const framerate = [index > -1 ? config[index + 1] : 4];

    const spawnOptions = ['-i', filename, '-an', '-filter_threads', '1', '-r', framerate, '-s', '640x480', '-f', 'mpjpeg', '-'];

    return spawn(FFMPEG, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    getFfmpegStream,
    playFile
};
