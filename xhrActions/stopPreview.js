const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    stringify = require(`${basedir}/libs/stringify`),
    {
        cleanupPreviewNodes
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    const uuid = request.query['x-uuid'];
    if (global.directStreamProcess) {
        cleanupPreviewNodes(uuid, global.directStreamProcess);
    } else if (global.imageStreamProcess) {
        cleanupPreviewNodes(uuid, global.imageStreamProcess);
    }
    response.writeHead(200, {});
    response.end('Preview should have stopped.');
    logger.info('Preview should have stopped.');
};
