const {
    spawn
} = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    {
        VIDEO
    } = require(`${basedir}/libs/libcamera/Constants`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    config = require(`${basedir}/libs/libcamera/videoConfig`);

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

function streamMjpeg(options = []) {

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
    streamMjpeg,
    saveH264,
    saveMjpeg
};
