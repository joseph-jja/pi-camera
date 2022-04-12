const previewProcessMap = {};
global.previewProcessMap = previewProcessMap;

function writeHeaders(response) {
    //const uuid = randomUUID();
    //previewProcesses[uid] = {};
    response.writeHead(200, {
        //'Content-Type': 'video/webm',
        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
        'Cache-Control': 'no-cache'
    });
}

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            previewProcess
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    const setupPreviewStream = (streamObject, response, uuid) => {

        if (previewProcessMap[uuid]) {
            previewProcessMap[uuid].kill('SIGKILL');
        }
        previewProcessMap[uuid] = previewProcess();

        writeHeaders(response);
        response.on('close', () => {
            try {
                previewProcessMap[uuid].stdout.unpipe(response);
            } catch(e) {
                logger.error(`Unpipe error ${stringify(e)}`);
            }
            try {
                streamObject.stdout.unpipe(previewProcessMap[uuid].stdin);
            } catch(e) {
                logger.error(`Unpipe error ${stringify(e)}`);
            }
            previewProcessMap[uuid].kill('SIGKILL');
            previewProcessMap[uuid] = undefined;
        });

        streamObject.stdout.pipe(previewProcessMap[uuid].stdin);
        previewProcessMap[uuid].stdout.pipe(response);

        streamObject.stdout.once('close', () => {
            logger.info('Preview stream closed!');
        });
    };

    return (request, response) => {
        const uuid = request.params['x-uuid'];
        if (global.directStreamProcess) {
            logger.info(`Running via directStreamProcess doing mjpeg video using: ${uuid}`);
            setupPreviewStream(global.directStreamProcess, response, uuid);
        } else if (global.imageStreamProcess) {
            logger.info(`Running via imageStreamProcess doing mjpeg video using: ${uuid}`);
            setupPreviewStream(global.imageStreamProcess, response, uuid);
        } else {
            response.writeHead(200, {});
            response.end('Preview service is not running or invalid identifier!');
        }
    };
};
