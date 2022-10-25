const {
    readFile
} = require('fs');

const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        captureEmitter
    } = require(`${basedir}/libs/videoScripts`),
    {
        BASE_IMAGE_PATH,
        BASE_CONFIG_PATH,
        previewSavedVideo
    } = require(`${basedir}/libs/videoScripts`),
    {
        OLD_FILENAME_MATCH
    } = require(`${basedir}/xhrActions/Constants`);

module.exports = (request, response) => {
    const query = (request.query || {});
    const filename = query.name;
    if (!filename) {
        response.writeHead(200, {});
        response.end('Missing parameters, nothing done!');
        logger.info('Missing parameters, nothing done!');
        return;
    }
    const filteredOldFilename = filename.match(OLD_FILENAME_MATCH);
    if (!filteredOldFilename) {
        response.writeHead(200, {});
        response.end('Invalid file name, nothing done!');
        logger.info('Invalid file name, nothing done!');
        return;
    }
    if (filename.endsWith('.png')) {
        response.writeHead(200, {
            'Content-type': 'image/png'
        });
        readFile(`${BASE_IMAGE_PATH}/${filename}`, (err, data) => {
            response.end(data);
        });
        readFile(`${BASE_CONFIG_PATH}/${filename}.cfg`, (err, data) => {
            captureEmitter.emit('button-exec', {
                method: 'previewImageConfig',
                status: (err || data).toString()
            });
        });
    } else if (filename.endsWith('.mjpeg') || filename.endsWith('.h264') || filename.endsWith('.raw')) {
        response.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
        });
        readFile(`${BASE_CONFIG_PATH}/${filename}.cfg`, (err, data) => {
            captureEmitter.emit('button-exec', {
                method: 'previewVideoConfig',
                status: (err || data).toString()
            });
        });
        previewSavedVideo(`${BASE_IMAGE_PATH}/${filename}`, response);
    } else {
        response.writeHead(200, {});
        response.end('Cannot preview file!');
    }
};
