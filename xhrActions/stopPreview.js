const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getVideoUpdateOptions
    } = require(`${basedir}/libs/libcamera/video`),
    {
        //cleanupPreviewNodes,
        getDirectStreamProcesss,
        getImageStreamProcess
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    //const uuid = request.query['x-uuid'];
    if (getDirectStreamProcesss()) {
        getDirectStreamProcesss(getVideoUpdateOptions());
        //cleanupPreviewNodes(uuid, getDirectStreamProcesss());
    } else if (getImageStreamProcess()) {
        //cleanupPreviewNodes(uuid, getImageStreamProcess());
    }
    response.writeHead(200, {});
    response.end('Preview should have stopped.');
    logger.info('Preview should have stopped.');
};
