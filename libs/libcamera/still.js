const {
    spawn
} = require('child_process');

const DEFAULT_IMAGE_CONFIG = [];

let lastImageUpdateOpts;

function getImageUpdateOptions() {
    return lastImageUpdateOpts;
}

function setImageUpdateOptions(opts) {
    lastImageUpdateOpts = opts;
}

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            LIBCAMERA_VIDEO
        } = require(`${resolveFileLocation}/libs/libcamera/Constants`),
        imageConfig = require(`${resolveFileLocation}/libs/libcamera/stillConfig`);

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
        const spawnOptions = ['-e', 'jpg', '-t', '0', '--timelapse', '10', '--immediate'].concat(options);

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');

        logger.info(`Libcamera still spawn options: ${stringify(spawnOptions)}`);

        return spawn(LIBCAMERA_VIDEO, spawnOptions, {
            env: process.env
        });
    }

    function saveImage(options) {

        const spawnOptions = ['-r'].concat(options);

        logger.info(`Libcamera still save image options: ${stringify(spawnOptions)}`);

        return spawn(LIBCAMERA_VIDEO, spawnOptions, {
            env: process.env
        });
    }

    return {
        getImageUpdateOptions,
        setImageUpdateOptions,
        streamJpeg,
        saveImage
    };
};