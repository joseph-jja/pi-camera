const childProcess = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            getOptions
        } = require(`${resolveFileLocation}/libs/utils`),
        {
            killAllRunning,
            directStream,
            setVideoUpdateOptions
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    return (request, response) => {
        if (request.body && Object.keys(request.body).length > 0) {
            const options = getOptions(request.body);
            if (options.length > 0) {
                setVideoUpdateOptions(options);
                const running = killAllRunning();
                directStream(options);
                response.writeHead(200, {});
                const message = `Executed script with options ${stringify(options)} on ${new Date()}`;
                response.end(message);
                logger.info(message);
            }
        } else {
            response.writeHead(200, {});
            response.end('No changes applied!');
        }
    };
};
