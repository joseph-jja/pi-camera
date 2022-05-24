const {
    spawn
} = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    getFirstVideoCaptureDevice = require(`${basedir}/libs/libcamera/getFirstVideoCaptureDevice`),
    getVideoStreamCommand = require(`${basedir}/libs/libcamera/getVideoStreamCommand`),
    logger = require(`${basedir}/libs/logger`)(__filename);

const DEFAULT_OPTIONS = [];

const MJPEG_DEFAULT_OPTIONS = ['--codec', 'mjpeg', '-t', '60000'],
    H264_DEFAULT_OPTIONS = ['--codec', 'h264', '-t', '60000'];

let lastVideoUpdateOpts;

function getVideoUpdateOptions() {
    return lastVideoUpdateOpts;
}

function setVideoUpdateOptions(opts) {
    lastVideoUpdateOpts = opts;
}

let VIDEO,
    FFMPEG,
    config,
    streamCommand = (options) => {
        if (VIDEO) {
            return piStreamMjpeg(options);
        } else if (FFMPEG) {
            return streamFfmpegMjpeg();
        }
        return () => {};
    };

async function initVideo() {

    const commands = await getVideoStreamCommand();
    VIDEO = commands.VIDEO;
    config = commands.videoConfig;
    FFMPEG = commands.FFMPEG;

    if (config && DEFAULT_OPTIONS.length === 0) {
        config.forEach(item => {
            if (item.defaultvalue) {
                item.defaultvalue.split(' ').forEach(item => {
                    DEFAULT_OPTIONS.push(item);
                });
            }
        });
    }
    setVideoUpdateOptions(DEFAULT_OPTIONS);

    const videoDevice = await getFirstVideoCaptureDevice();
    if (videoDevice.length === 0) {
        logger.error('No video devices found!');
        return undefined;
    }
}

async function streamFfmpegMjpeg() {

    const videoDevice = await getFirstVideoCaptureDevice();
    if (videoDevice.length === 0) {
        logger.error('No video devices found!');
        return undefined;
    }

    const spawnOptions = ['-f', 'video4linux2', '-i', videoDevice[0], '-q:v', '2', '-f', 'mpjpeg', '-'];

    logger.info(`Using ffmpeg for video with options: ${stringify(spawnOptions)}`);

    return spawn(FFMPEG, spawnOptions, {
        env: process.env
    });
}

async function piStreamMjpeg(options = []) {

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

    const defaultOptions = MJPEG_DEFAULT_OPTIONS.concat();
    if (options.indexOf('-t') > -1) {
        defaultOptions[defaultOptions.indexOf('-t') + 1] = options[options.indexOf('-t') + 1];
    }

    const spawnOptions = defaultOptions.concat(options);

    logger.info(`Libcamera video save h264 options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

function saveMjpeg(options = []) {

    const defaultOptions = MJPEG_DEFAULT_OPTIONS.concat();
    if (options.indexOf('-t') > -1) {
        defaultOptions[defaultOptions.indexOf('-t') + 1] = options[options.indexOf('-t') + 1];
    }

    const spawnOptions = defaultOptions.concat(options);

    logger.info(`Libcamera video save mjpeg options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    initVideo,
    getVideoUpdateOptions,
    setVideoUpdateOptions,
    streamMjpeg: streamCommand,
    saveH264,
    saveMjpeg
};
