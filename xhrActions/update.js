const childProcess = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            getOptions
        } = require(`${resolveFileLocation}/libs/utils`),
        {
            getAllRunning,
            directStream,
            setVideoUpdateOptions
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    return (request, response) => {
        if (request.body && Object.keys(request.body).length > 0) {
            const options = getOptions(request.body);
            if (options.length > 0) {
                setVideoUpdateOptions(options);
                const running = getAllRunning();
                if (running.length > 0) {
                    childProcess.exec(`kill -9 ${running} ${libcameraPid}`, () => {
                        global.libcameraProcess = undefined;
                        global.directStreamProcess = undefined;
                        global.imageStreamProcess = undefined;
                        directStream(options);
                    });
                } else {
                    directStream(options);
                }
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
