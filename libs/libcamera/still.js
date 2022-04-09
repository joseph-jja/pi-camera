const { spawn } = require('childProcess');

module.exports = function(resolveFileLocation) {

    const { LIBCAMERA_VIDEO } = require(`${resolveFileLocation}/libs/libcamera/Constants`);

    function streamJpeg(options) {

        // default image streaming options
        const spawnOptions = ['-e', 'jpg', '-t', '0', '--timelapse', '10', '--immediate'];

        // process input options

        // stream to stdout
        spawnOptions.push('-o');
        spawnOptions.push('-');
        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    function saveImage(options) {
        const spawnOptions = ['r'];

        return spawn(LIBCAMERA_VIDEO, spawnOptions);
    }

    return  {
        streamJpeg,
        saveImage
    };
};
