const {
    spawn
} = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    getVideoStreamCommand = require(`${basedir}/libs/libcamera/getVideoStreamCommand`),
    logger = require(`${basedir}/libs/logger`)(__filename);

const DEFAULT_IMAGE_CONFIG = [];

let lastImageUpdateOpts;

function getImageUpdateOptions() {
    return lastImageUpdateOpts;
}

function setImageUpdateOptions(opts) {
    lastImageUpdateOpts = opts;
}

let STILL,
    imageConfig;

async function initStill() {

    const commands = await getVideoStreamCommand();
    STILL = commands.STILL;
    imageConfig = commands.imageConfig;

    if (imageConfig && DEFAULT_IMAGE_CONFIG.length === 0) {
        imageConfig.forEach(item => {
            if (item.defaultvalue) {
                item.defaultvalue.split(' ').forEach(item => {
                    DEFAULT_IMAGE_CONFIG.push(item);
                });
            }
        });
    }
    setImageUpdateOptions(DEFAULT_IMAGE_CONFIG);
}

// misnamed function
// really this is just to test the options for image capture
function streamJpeg(options) {

    // default image streaming options
    // this is more a default image test
    const spawnOptions = ['-e', 'jpg'].concat(options);

    // only test this for 1 second
    const shutterTime = spawnOptions.indexOf('--shutter');
    if (shutterTime > -1 && parseInt(spawnOptions[shutterTime + 1]) > 1000000) {
        spawnOptions[shutterTime + 1] = 1000000;
    }

    // only test this for 1 second
    const captureTime = spawnOptions.indexOf('-t');
    if (captureTime > -1) {
        spawnOptions[captureTime + 1] = 1000;
    } else {
        spawnOptions.push('-t');
        spawnOptions.push(1000);
    }

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
    const spawnOptions = [].concat(options);

    logger.info(`Libcamera still save image options: ${stringify(spawnOptions)}`);

    return spawn(STILL, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    initStill,
    getImageUpdateOptions,
    setImageUpdateOptions,
    streamJpeg,
    saveImage
};
