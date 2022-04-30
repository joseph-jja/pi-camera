const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename);

module.exports = (request, response) => {
    const uuid = request.query['x-uuid'];
    response.writeHead(200, {});
    const message = `Preview should have stopped for : ${uuid}`;
    response.end(message);
    logger.info(message);
};