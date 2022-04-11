
module.exports = function(resolveFileLocation) {
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    return (request, response) => {
        const uuid = request.params['x-uuid'];
        if (global.previewProcessMap[uuid]) {
            global.previewProcessMap[uuid].kill('SIGKILL');
            global.previewProcessMap[uuid] = undefined;
        }
        response.writeHead(200, {});
        response.end('Preview should have stopped.');
        logger.info('Preview should have stopped.');
    };
};
