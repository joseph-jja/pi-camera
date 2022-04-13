const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        previewStream
    } = require(`${basedir}/libs/ffmpeg`),
    {
        cleanupPreviewNodes,
        getDirectStreamProcesss,
        getPreviewProcessMap,
        setPreviewProcessMap
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

    const previewProcessMap = getPreviewProcessMap();
    if (previewProcessMap[uuid]) {
        cleanupPreviewNodes(uuid, streamObject);
    }

    const previewClients = Object.keys(previewProcessMap);
    if (previewClients.length > MAX_PREVIEW_CLIENT) {
        previewClients.forEach(key => {
            cleanupPreviewNodes(key, streamObject);
        });
    }

    setPreviewProcessMap(uuid, previewStream());

    writeHeaders(response);
    response.on('finish', () => {
        cleanupPreviewNodes(uuid, streamObject);
    });

    streamObject.stdout.on('data', d => {
        previewProcessMap[uuid].stdin.write(d);
    });
    previewProcessMap[uuid].stdout.on('data', d => {
        response.write(d);
    });
};

module.exports = (request, response) => {
    const uuid = `${request.query['x-uuid']}`;
    if (uuid && getDirectStreamProcesss()) {
        logger.info(`Running via directStreamProcess doing mjpeg video using: ${uuid}`);
        setupPreviewStream(getDirectStreamProcesss(), response, uuid);
    } else if (uuid && global.imageStreamProcess) {
        logger.info(`Running via imageStreamProcess doing mjpeg video using: ${uuid}`);
        setupPreviewStream(global.imageStreamProcess, response, uuid);
    } else {
        response.writeHead(200, {});
        response.end('Preview service is not running or invalid identifier!');
    }
};
