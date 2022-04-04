const childProcess = require('child_process');

module.exports = function(resolveFileLocation) {
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    return (request, response) => {
        try {
            childProcess.execSync(`kill -9 \`ps -ef | grep previewStream | awk '{print $2}' | grep -v grep \``);
            childProcess.exec(`kill -9 \`ps -ef | grep "filter:v fps" | awk '{print $2}' | grep -v grep \``);
            logger.info('Killed all preview processes');
        } catch(e) {
            logger.info('Nothing happened!');
        }
        response.writeHead(200, {});
        response.end('Preview should have stopped.');
        logger.info('Preview should have stopped.');
    };
};
