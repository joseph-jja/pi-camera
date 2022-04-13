const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    stringify = require(`${basedir}/libs/stringify`);

module.exports = (request, response) => {
    const uuid = request.query['x-uuid'];
    if (global.previewProcessMap[uuid]) {
        try {
            global.previewProcessMap[uuid].stdout.unpipe();
        } catch (e) {
            logger.error(`Unpipe preview process error ${stringify(e)}`);
        }
        try {
            if (global.directStreamProcess) {
                global.directStreamProcess.stdout.unpipe(global.previewProcessMap[uuid].stdin);
            } else if (global.imageStreamProcess) {
                global.imageStreamProcess.stdout.unpipe(global.previewProcessMap[uuid].stdin);
            }
        } catch (e) {
            logger.error(`Unpipe stdout error ${stringify(e)}`);
        }
        global.previewProcessMap[uuid].kill('SIGKILL');
        global.previewProcessMap[uuid] = undefined;
    }
    response.writeHead(200, {});
    response.end('Preview should have stopped.');
    logger.info('Preview should have stopped.');
};
