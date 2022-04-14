const childProcess = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getOptions
    } = require(`${basedir}/libs/utils`),
    {
        setImageUpdateOptions,
        imageStream,
        getLibcameraProcess,
        getDirectStreamProcesss,
        unsetDirectStreamProcesss,
        getImageStreamProcess,
        setImageStreamProcess
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    if (request.body && Object.keys(request.body).length > 0) {
        const options = getOptions(request.body);
        if (options.length > 0) {
            setImageUpdateOptions(options);
            const libcameraPid = (getLibcameraProcess() ? getLibcameraProcess().pid : '');
            if (getDirectStreamProcesss()) {
                const pid = getDirectStreamProcesss().pid;
                childProcess.exec(`kill -9 ${pid} ${libcameraPid}`, () => {
                    unsetDirectStreamProcesss();
                });
            }
            if (getImageStreamProcess()) {
                const pid = getImageStreamProcess().pid;
                childProcess.exec(`kill -9 ${pid} ${libcameraPid}`, () => {
                    setImageStreamProcess(undefined);
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
