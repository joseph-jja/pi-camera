const { spawn } = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`);
    const { LIBCAMERA_VIDEO } = require(`${resolveFileLocation}/libs/libcamera/Constants`);
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    function streamMjpeg(options = []) {

        // default image streaming options
        const spawnOptions = ['--codec', 'mjpeg', '-t', '0'].concat(options);

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');
        logger.info(`Libcamera spawn options ${stringify(spawnOptions)}`);
        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    function saveMjpeg(options = []) {

        const spawnOptions = ['--codec', 'mjpeg'].concat(options);

        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    function saveH264(options = []) {

        const spawnOptions = ['--codec', 'h264'].concat(options);
 
        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    return  {
        streamMjpeg,
        saveMjpeg,
        saveH264
    };
};
