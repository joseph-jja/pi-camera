const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getOptions
    } = require(`${basedir}/libs/utils`),
    {
        setVideoUpdateOptions
    } = require(`${basedir}/libs/libcamera/video`),
    {
        directStream
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    if (request.body && Object.keys(request.body).length > 0) {
        const options = getOptions(request.body);
        if (options.length > 0) {
            setVideoUpdateOptions(options);
            directStream(options);
            response.writeHead(200, {});
            const message = `Executed script with options ${stringify(options)} on ${new Date()}`;
            response.end(message);
            logger.info(message);
            return;
        }
    }
    response.writeHead(200, {});
    response.end('No changes applied!');
};