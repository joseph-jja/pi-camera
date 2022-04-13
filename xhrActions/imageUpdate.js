const childProcess = require('child_process');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            getOptions
        } = require(`${resolveFileLocation}/libs/utils`),
        {
            setImageUpdateOptions,
            imageStream
        } = require(`${resolveFileLocation}/libs/videoScripts`);

    return (request, response) => {
        if (request.body && Object.keys(request.body).length > 0) {
            const options = getOptions(request.body);
            if (options.length > 0) {
                setImageUpdateOptions(options);
                const libcameraPid = (global.libcameraProcess ? global.libcameraProcess.pid : '');
                if (global.directStreamProcess) {
                    const pid = global.directStreamProcess.pid;
                    childProcess.exec(`kill -9 ${pid} ${libcameraPid}`, () => {
                        global.directStreamProcess = undefined;
                    });
                }
                if (global.imageStreamProcess) {
                    const pid = global.imageStreamProcess.pid;
                    childProcess.exec(`kill -9 ${pid} ${libcameraPid}`, () => {
                        global.imageStreamProcess = undefined;
                        imageStream(options);
                    });
                } else {
                    imageStream(options);
                }
                response.writeHead(200, {});
                const message = `Executed image script with options ${stringify(options)} on ${new Date()}`;
                response.end(message);
                logger.info(message);
            }
        } else {
            response.writeHead(200, {});
            response.end('No changes applied!');
        }
    };
};
