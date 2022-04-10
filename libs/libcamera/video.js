const { spawn } = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`);
    const { LIBCAMERA_VIDEO } = require(`${resolveFileLocation}/libs/libcamera/Constants`);
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    function streamMjpeg(options = []) {

        // default image streaming options
        const spawnOptions = [LIBCAMERA_VIDEO, '--codec', 'mjpeg', '-t', '0'].concat(options);

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');

        logger.info(`Libcamera video: ${LIBCAMERA_VIDEO} options: ${stringify(spawnOptions)}`);

        return spawnOptions.join(' ');
        /*return spawn(LIBCAMERA_VIDEO, spawnOptions, {
            env: process.env
        });*/
    }

    function saveH264(options = []) {

        const spawnOptions = ['--codec', 'h264', '-t', '60000'].concat(options);

        logger.info(`Libcamera video save h264 options: ${stringify(spawnOptions)}`);

        return spawn(LIBCAMERA_VIDEO, spawnOptions, {
            env: process.env
        });
    }

    return  {
        streamMjpeg,
        saveH264
    };
};
