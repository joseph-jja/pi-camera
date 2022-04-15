const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getDirectStreamProcesss
    } = require(`${basedir}/libs/videoScripts`);

function errorHandler() {
    logger.info('Video streaming error');
}

function setupPreviewStream(streamObject, response, uuid) {

    response.writeHead(200, {
        //'Content-Type': 'video/webm',
        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
        'Cache-Control': 'no-cache',
        'x-uuid': uuid
    });

    streamObject.stdout.pipe(response);

    streamObject.stdout.on('error', errorHandler);
}

module.exports = (request, response) => {
    const uuid = `${request.query['x-uuid']}`;
    if (uuid && getDirectStreamProcesss()) {
        logger.info(`Running via directStreamProcess doing mjpeg video using: ${uuid}`);
        setupPreviewStream(getDirectStreamProcesss(), response, uuid);
    } else {
        response.writeHead(200, {});
        response.end('Preview service is not running or invalid identifier!');
    }
};
