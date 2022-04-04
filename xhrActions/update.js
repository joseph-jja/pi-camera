const childProcess = require('child_process'),
    {
        resolve,
        basename
    } = require('path');

const FILENAME = basename(__filename);
const RESOLVED_FILE_LOCATION = resolve(__filename).replace(`/${FILENAME}`, '');

const stringify = require(`${RESOLVED_FILE_LOCATION}/libs/stringify`),
    logger = require(`${RESOLVED_FILE_LOCATION}/libs/logger`)(__filename),
    {
        filterRequestBody
    } = require(`${RESOLVED_FILE_LOCATION}/libs/utils`),
    {
        directStream,
        setVideoUpdateOptions
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION);

module.exports = (request, response) => {
    if (request.body && Object.keys(request.body).length > 0) {
        const options = filterRequestBody(request.body);
        if (options.length > 0) {
            const spawnOpts = options.map(item => {
                return item.split(' ');
            }).reduce((acc, next) => acc.concat(next));
            setVideoUpdateOptions(spawnOpts);
            if (global.directStreamProcess) {
                const pid = global.directStreamProcess.pid;
                childProcess.exec(`kill -9 ${pid}`, () => {
                    global.directStreamProcess = undefined;
                    directStream(spawnOpts);
                });
            } else {
                directStream(spawnOpts);
            }
            response.writeHead(200, {});
            const message = `Executed script with options ${stringify(spawnOpts)} on ${new Date()}`;
            response.end(message);
            logger.info(message);
        }
    } else {
        response.writeHead(200, {});
        response.end('No changes applied!');
    }
};
