const {
    spawn
} = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        STILL
    } = require(`${basedir}/libs/libcamera/Constants`),
    imageConfig = require(`${basedir}/libs/libcamera/stillConfig`);

const DEFAULT_IMAGE_CONFIG = [];

let lastImageUpdateOpts;

function getImageUpdateOptions() {
    return lastImageUpdateOpts;
}

function setImageUpdateOptions(opts) {
    lastImageUpdateOpts = opts;
}

if (DEFAULT_IMAGE_CONFIG.length === 0) {
    imageConfig.forEach(item => {
        if (item.defaultvalue) {
            item.defaultvalue.split(' ').forEach(item => {
                DEFAULT_IMAGE_CONFIG.push(item);
            });
        }
    });
    setImageUpdateOptions(DEFAULT_IMAGE_CONFIG);
}

function streamJpeg(options) {

    // default image streaming options
    // this is more a default image test
    const spawnOptions = ['-e', 'jpg', '-t', '1000'].concat(options);

    // stream to stdout
    spawnOptions.push('-o');
    spawnOptions.push('/dev/null');

    logger.info(`Libcamera still spawn options: ${stringify(spawnOptions)}`);

    return spawn(STILL, spawnOptions, {
        env: process.env
    });
}

function saveImage(options) {

    // 60 seconds of images each time
    const spawnOptions = ['-r'].concat(options);

    logger.info(`Libcamera still save image options: ${stringify(spawnOptions)}`);

    return spawn(STILL, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    getImageUpdateOptions,
    setImageUpdateOptions,
    streamJpeg,
    saveImage
};
