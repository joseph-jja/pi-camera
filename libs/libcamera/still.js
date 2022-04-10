const { spawn } = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`);
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);
    const { LIBCAMERA_VIDEO } = require(`${resolveFileLocation}/libs/libcamera/Constants`);

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

    return  {
        streamJpeg,
        saveImage
    };
};
