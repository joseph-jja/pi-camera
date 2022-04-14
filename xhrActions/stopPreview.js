const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getImageUpdateOptions
    } = require(`${basedir}/libs/libcamera/video`),
    {
        getVideoUpdateOptions
    } = require(`${basedir}/libs/libcamera/video`),
    {
        getDirectStreamProcesss,
        getImageStreamProcess
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    const uuid = request.query['x-uuid'];
    if (getDirectStreamProcesss()) {
        getDirectStreamProcesss(getVideoUpdateOptions());
    } else if (getImageStreamProcess()) {
        getImageStreamProcess(getImageUpdateOptions());
    }
    response.writeHead(200, {});
    const message = `Preview should have stopped for : ${uuid}`;
    response.end(message);
    logger.info(message);
};
