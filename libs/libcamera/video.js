const { spawn } = require('child_process');

module.exports = function(resolveFileLocation) {

    const { LIBCAMERA_VIDEO } = require(`${resolveFileLocation}/libs/libcamera/Constants`);
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    function streamMjpeg(options = []) {

        // default image streaming options
        const spawnOptions = ['--codec', 'mjpeg', '-t', '0'].concat(options);

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');
        console.log('Libcamera spawn options ', spawnOptions);
        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    function saveMjpeg(options = []) {

        const spawnOptions = ['--codec', 'mjpeg'];

        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    function saveH264(options = []) {

        const spawnOptions = ['--codec', 'h264'];

        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    return  {
        streamMjpeg,
        saveMjpeg,
        saveH264
    };
};
