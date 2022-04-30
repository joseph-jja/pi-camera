const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    getEnvVar = require(`${basedir}/libs/env`).getEnvVar,
    {
        getDirectStreamProcesss,
        captureEmitter
    } = require(`${basedir}/libs/videoScripts`);

function errorHandler() {
    logger.info('Video streaming error');
}

const CONTENT_TYPE = getEnvVar('STREAM_WEBM') ? 'video/webm' :
    'multipart/x-mixed-replace;boundary=ffmpeg';

function setupPreviewStream(streamObject, response, uuid) {

    response.writeHead(200, {
        //'Content-Type': 'video/webm',
        'Content-Type': CONTENT_TYPE,
        'Cache-Control': 'no-cache',
        'x-uuid': uuid
    });

    streamObject.stdout.pipe(response);

    streamObject.stdout.on('error', errorHandler);
}

module.exports = (request, response) => {
    const uuid = `${request.query['x-uuid']}`;
    if (uuid && getDirectStreamProcesss()) {
        logger.info(`Running via directStreamProcess sending video ${CONTENT_TYPE} using: ${uuid}`);
        setupPreviewStream(getDirectStreamProcesss(), response, uuid);
    } else {
        response.writeHead(200, {});
        response.end('Preview service is not running or invalid identifier!');
        captureEmitter.emit('button-exec', {
            method: 'previewStream',
            status: 'Preview service is not running'
        });
    }
};