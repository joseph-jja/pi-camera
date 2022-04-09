const { spawn } = require('childProcess');

module.exports = function(resolveFileLocation) {

    const { LIBCAMERA_STILL } = require(`${resolveFileLocation}/libs/libcamera/Constants`);

    function streamMjpeg(options) {

        // default image streaming options
        const spawnOptions = ['--codec', 'mjpeg', '-t', '0'];

        // process input options

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');
        return spawn(LIBCAMERA_STILL, spawnOptions);
    }

    function saveMjpeg(options) {

    }

    function saveH264(options) {

    }

    return  {
        streamMjpeg,
        saveMjpeg,
        saveH264
    };
};
