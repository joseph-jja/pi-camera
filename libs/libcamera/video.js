const {
        readdir
    } = require('fs'),
    {
        spawn
    } = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    getEnvVar = require(`${basedir}/libs/env`).getEnvVar,
    getFirstVideoCaptureDevice = require(`${basedir}/libs/libcamera/getFirstVideoCaptureDevice`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        VIDEO
    } = (getEnvVar('LEGACY_STACK') ?
        require(`${basedir}/libs/libcamera/RConstants`) :
        require(`${basedir}/libs/libcamera/Constants`)),
    config = (getEnvVar('LEGACY_STACK') ?
        require(`${basedir}/libs/libcamera/rvideoConfig`) :
        require(`${basedir}/libs/libcamera/videoConfig`));

const DEFAULT_OPTIONS = [];

let lastVideoUpdateOpts;

function getVideoUpdateOptions() {
    return lastVideoUpdateOpts;
}

function setVideoUpdateOptions(opts) {
    lastVideoUpdateOpts = opts;
}

if (DEFAULT_OPTIONS.length === 0) {
    config.forEach(item => {
        if (item.defaultvalue) {
            item.defaultvalue.split(' ').forEach(item => {
                DEFAULT_OPTIONS.push(item);
            });
        }
    });
    setVideoUpdateOptions(DEFAULT_OPTIONS);
}

async function streamFfmpegMjpeg() {

    const videoDevice = await getFirstVideoCaptureDevice();
    if (videoDevice.length === 0 ) {
        logger.error('No video devices found!');
        return undefined;
    }

    const spawnOptions = ['-f', 'video4linux2', '-i', videoDevice[0], '-q:v', '2', '-f', 'mpjpeg', '-'];

    logger.info(`Using ffmpeg for video with options: ${stringify(spawnOptions)}`);

    return spawn('ffmpeg', spawnOptions, {
        env: process.env
    });
}

async function streamMjpeg(options = []) {

    // default image streaming options
    const spawnOptions = ['--codec', 'mjpeg', '-t', '0'].concat(options);

    // stream to stdout
    spawnOptions.push('-o');
    spawnOptions.push('-');

    logger.info(`Libcamera video: ${VIDEO} options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

function saveH264(options = []) {

    const spawnOptions = ['--codec', 'h264', '-t', '60000'].concat(options);

    logger.info(`Libcamera video save h264 options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

function saveMjpeg(options = []) {

    const spawnOptions = ['--codec', 'mjpeg', '-t', '60000'].concat(options);

    logger.info(`Libcamera video save mjpeg options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    getVideoUpdateOptions,
    setVideoUpdateOptions,
    streamMjpeg: (getEnvVar('NO_LIBCAMERA') ? streamFfmpegMjpeg : streamMjpeg),
    saveH264,
    saveMjpeg
};
