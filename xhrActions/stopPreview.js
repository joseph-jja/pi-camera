const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename);

module.exports = (request, response) => {
    const uuid = request.query['x-uuid'];
    if (global.previewProcessMap[uuid]) {
        global.previewProcessMap[uuid].kill('SIGKILL');
        global.previewProcessMap[uuid] = undefined;
    }
    response.writeHead(200, {});
    response.end('Preview should have stopped.');
    logger.info('Preview should have stopped.');
};