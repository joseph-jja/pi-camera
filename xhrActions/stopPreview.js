const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        cleanupPreviewNodes,
        getDirectStreamProcesss,
        getImageStreamProcess
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    const uuid = request.query['x-uuid'];
    if (getDirectStreamProcesss()) {
        cleanupPreviewNodes(uuid, getDirectStreamProcesss());
    } else if (getImageStreamProcess()) {
        cleanupPreviewNodes(uuid, getImageStreamProcess());
    }
    response.writeHead(200, {});
    response.end('Preview should have stopped.');
    logger.info('Preview should have stopped.');
};
