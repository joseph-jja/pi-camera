const {
    spawn
} = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    getFirstVideoCaptureDevice = require(`${basedir}/libs/libcamera/getFirstVideoCaptureDevice`),
    getVideoStreamCommand = require(`${basedir}/libs/libcamera/getVideoStreamCommand`),
    logger = require(`${basedir}/libs/logger`)(__filename);

const DEFAULT_OPTIONS = [];

const MJPEG_CODEC = 'mjpeg',
    H264_CODEC = 'h264',
    LIBAV_CODEC = 'libav;

let lastVideoUpdateOpts;

function getVideoUpdateOptions() {
    return lastVideoUpdateOpts;
}

function setVideoUpdateOptions(opts) {
    lastVideoUpdateOpts = opts;
}

let VIDEO,
    RAW_VIDEO,
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
    RAW_VIDEO = commands.RAW_VIDEO;
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

function saveVideo(codec = 'mjpeg', options = []) {
    const defaultOptions = [];
    if (options.indexOf('-t') < 0) {
        defaultOptions.push('-t');
        defaultOptions.push(60000);
    }

    defaultOptions.push('--codec')
    switch (codec) {
    case H264_CODEC:
        defaultOptions.push(H264_CODEC);
        break;
    case LIBAV_CODEC:
        defaultOptions.push(LIBAV_CODEC);
        break;
    default:
        defaultOptions.push(MJPEG_CODEC);
        break;
    }

    const spawnOptions = defaultOptions.concat(options);

    logger.info(`Libcamera video save ${codec} options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

function saveH264(options = []) {
    return saveVideo(H264_CODEC, options);
}

function saveMjpeg(options = []) {
    return saveVideo(MJPEG_CODEC, options);
}

function saveLibav(options = []) {
    return saveVideo(LIBAV_CODEC, options);
}

module.exports = {
    initVideo,
    getVideoUpdateOptions,
    setVideoUpdateOptions,
    streamMjpeg: streamCommand,
    saveH264,
    saveMjpeg,
    saveLibav
};
