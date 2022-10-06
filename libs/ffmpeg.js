const {
    spawn
} = require('child_process');

const basedir = process.cwd(),
    getVideoStreamCommand = require(`${basedir}/libs/libcamera/getVideoStreamCommand`);

let FFMPEG;

const DIRECT_STREAM_OPTS = ['-i', 'pipe:',
        '-an',
        '-filter_threads', '1',
        '-r', '4',
        '-q:v', '2',
        '-s', '640x480',
        '-f', 'mpjpeg', '-'
    ],
    WEB_DIRECT_STREAM_OPTS = ['-i', 'pipe:',
        '-an',
        '-filter_threads', '1',
        '-r', '4',
        '-q:v', '2',
        '-s', '640x480',
        '-c:v', 'libvpx',
        '-crf', '10',
        '-b:v', '1M',
        '-c:a', 'libvorbis', '-'
    ];

const defaultFramerateIndex = DIRECT_STREAM_OPTS.indexOf('-r') + 1;

async function initFfmpeg() {

    const commands = await getVideoStreamCommand();
    FFMPEG = commands.FFMPEG;
}

function getFfmpegWebmStream(framerate = 4) {
    WEB_DIRECT_STREAM_OPTS[defaultFramerateIndex] = framerate;
    return spawn(FFMPEG, WEB_DIRECT_STREAM_OPTS, {
        env: process.env
    });
}

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

    const spawnOptions = ['-i', filename,
        '-an',
        '-filter_threads', '1',
        '-r', framerate,
        '-q:v', '2',
        '-s', '640x480',
        '-f', 'mpjpeg', '-'
    ];

    return spawn(FFMPEG, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    initFfmpeg,
    getFfmpegWebmStream,
    getFfmpegStream,
    playFile
};
