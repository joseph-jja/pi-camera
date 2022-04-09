const { spawn } = require('child_process');

module.exports = function(resolveFileLocation) {

    const { LIBCAMERA_STILL } = require(`${resolveFileLocation}/libs/libcamera/Constants`);

    function streamMjpeg(options = []) {

        // default image streaming options
        const spawnOptions = ['--codec', 'mjpeg', '-t', '0'].concat(options);

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');
        return spawn(LIBCAMERA_STILL, spawnOptions);
    }

    function saveMjpeg(options = []) {

        const spawnOptions = ['--codec', 'mjpeg'];

        return spawn(LIBCAMERA_STILL, spawnOptions);
    }

    function saveH264(options = []) {

        const spawnOptions = ['--codec', 'h264'];

        return spawn(LIBCAMERA_STILL, spawnOptions);
    }

    return  {
        streamMjpeg,
        saveMjpeg,
        saveH264
    };
};
