const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        previewStream
    } = require(`${basedir}/libs/ffmpeg`),
    {
        cleanupPreviewNodes
    } = require(`${basedir}/libs/videoScripts`);

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

const setupPreviewStream = async (streamObject, response, uuid) => {

    let shouldWait = false,
        promiseMaps;
    if (global.previewProcessMap[uuid]) {
        shouldWait = true;
        promiseMaps = Promise.all([
            streamObject.stdout.writer.once('unpipe', (src) => {
                Promise.resolve(src);
            }),
            global.previewProcessMap[uuid].stdout.once('unpipe', (src) => {
                Promise.resolve(src);
            })
        ], results => {
            logger.info('Should be ready.');
            return results;
        });

        cleanupPreviewNodes(uuid, streamObject);
    }

    const previewClients = Object.keys(global.previewProcessMap);
    if (previewClients.length > MAX_PREVIEW_CLIENT) {
        previewClients.forEach(key => {
            cleanupPreviewNodes(key, streamObject);
        });
    }

    if (shouldWait) {
        const msg = await promiseMaps;
        logger.info(msg);
    }
    global.previewProcessMap[uuid] = previewStream();

    writeHeaders(response);
    response.on('finish', () => {
        cleanupPreviewNodes(uuid, streamObject);
    });

    streamObject.stdout.pipe(global.previewProcessMap[uuid].stdin);
    global.previewProcessMap[uuid].stdout.pipe(response);
};

module.exports = (request, response) => {
    const uuid = `${request.query['x-uuid']}`;
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
