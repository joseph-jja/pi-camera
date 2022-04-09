const childProcess = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            getOptions
        } = require(`${resolveFileLocation}/libs/utils`),
        {
            directStream,
            setVideoUpdateOptions
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    return (request, response) => {
        if (request.body && Object.keys(request.body).length > 0) {
            const options = getOptions(request.body);
            if (options.length > 0) {
                setVideoUpdateOptions(options);
                if (global.imageStreamProcess) {
                    const pid = global.imageStreamProcess.pid;
                    childProcess.exec(`kill -9 ${pid}`, () => {
                        global.imageStreamProcess = undefined;
                    });
                }
                if (global.directStreamProcess) {
                    const pid = global.directStreamProcess.pid;
                    childProcess.exec(`kill -9 ${pid}`, () => {
                        global.directStreamProcess = undefined;
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
