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

const MAX_PREVIEW_CLIENT = 4;

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            previewStream
        } = require(`${resolveFileLocation}/libs/ffmpeg`);


    const cleanupNodes = (uuid, streamObject) => {
        try {
            previewProcessMap[uuid].stdout.unpipe();
        } catch(e) {
            logger.error(`Unpipe preview process error ${stringify(e)}`);
        }
        try {
            streamObject.stdout.unpipe(previewProcessMap[uuid].stdin);
        } catch(e) {
            logger.error(`Unpipe stdout error ${stringify(e)}`);
        }
        try {
			streamObject.stdout.once('close', () => {
				logger.info('Preview stream closed!');
			});
            previewProcessMap[uuid].kill('SIGKILL');
        } catch(e) {
            logger.error(`kill error ${stringify(e)}`);
        }
        try {
            previewProcessMap[uuid] = undefined;
        } catch(e) {
            logger.error(`Undef error ${stringify(e)}`);
        }
    };

    const setupPreviewStream = (streamObject, response, uuid) => {

        if (previewProcessMap[uuid]) {
            cleanupNodes(uuid, streamObject);
        }
        const previewClients = Object.keys(previewProcessMap);
        if (previewClients.length > MAX_PREVIEW_CLIENT) {
            previewClients.forEach(key => {
                cleanupNodes(key, streamObject);
            });
        }

        previewProcessMap[uuid] = previewStream();

        writeHeaders(response);
        response.on('finish', () => {
            cleanupNodes(uuid, streamObject);
        });

        streamObject.stdout.pipe(previewProcessMap[uuid].stdin);
        previewProcessMap[uuid].stdout.pipe(response);
    };

    return (request, response) => {
        const uuid = request.query['x-uuid'];
        if (uuid && global.directStreamProcess) {
            logger.info(`Running via directStreamProcess doing mjpeg video using: ${uuid}`);
            setupPreviewStream(global.directStreamProcess, response, uuid);
        } else if (uuid && global.imageStreamProcess) {
            logger.info(`Running via imageStreamProcess doing mjpeg video using: ${uuid}`);
            setupPreviewStream(global.imageStreamProcess, response, uuid);
        } else {
            response.writeHead(200, {});
            response.end('Preview service is not running or invalid identifier!');
        }
    };
};
