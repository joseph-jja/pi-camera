const fs = require('fs');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        initStill,
        saveImage
    } = require(`${basedir}/libs/libcamera/still`);

const BASE_IMAGE_PATH = '/tmp';

function captureSingleImage(options = [], socket) {

    const spawnOptions = options.concat();

    const basefilename = 'capture.jpg';
    const filename = `${BASE_IMAGE_PATH}/${basefilename}`;
    spawnOptions.push('-o');
    spawnOptions.push(filename);
    logger.info(`Saving image with options: ${stringify(spawnOptions)}`);

    const imageDataProcess = saveImage(spawnOptions);

    imageDataProcess.on('close', (code) => {
        fs.readFile(filename, (err, data) => {
            socket.emit('view-image', {
                status: err || 'success',
                message: `Saved image with code ${code}`,
                img: data.toString('base64')
            });
        });
    });
}

initStill();

module.exports = (socket) => {

    socket.on('get-image', (sock) => {
        const options = sock.options || [];

        logger.info(`Client requested image with options: ${stringify(options)}`);

        captureSingleImage(options, socket);
    });

    socket.emit('connected', {
        message: 'Connected!'
    });
};
