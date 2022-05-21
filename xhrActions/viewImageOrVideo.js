const {
    readFile
} = require('fs');

const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        BASE_IMAGE_PATH,
        previewSavedVideo
    } = require(`${basedir}/libs/videoScripts`),
    {
        OLD_FILENAME_MATCH,
        PLATE_SOLVE_DIR,
        PLATE_SOLVE_FILENAME_MATCH
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
    const filteredOldFilename = filename.match(OLD_FILENAME_MATCH),
        plateSolveOldFilename = filename.match(PLATE_SOLVE_FILENAME_MATCH);
    if (!filteredOldFilename && !plateSolveOldFilename) {
        response.writeHead(200, {});
        response.end('Invalid file name, nothing done!');
        logger.info('Invalid file name, nothing done!');
        return;
    }
    if (filename.endsWith('.jpg')) {
        response.writeHead(200, {
            'Content-type': 'image/jpeg'
        });
        readFile(`${BASE_IMAGE_PATH}/${filename}`, (err, data) => {
            response.end(data);
        });
    } else if (filename.endsWith('.mjpeg') || filename.endsWith('.h264')) {
        response.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
        });
        previewSavedVideo(`${BASE_IMAGE_PATH}/${filename}`, response);
    } else if (filename.endsWith('.png')) {
        response.writeHead(200, {
            'Content-type': 'image/png'
        });
        readFile(`${PLATE_SOLVE_DIR}/${filename}`, (err, data) => {
            response.end(data);
        });
    } else {
        response.writeHead(200, {});
        response.end('Cannot preview file!');
    }
};
