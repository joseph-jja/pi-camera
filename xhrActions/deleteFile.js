const {
    unlink
} = require('fs');

const OLD_FILENAME_MATCH = /^[a-zA-Z]*-(\d)*\.[a-z]*$/;

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            BASE_IMAGE_PATH,
            BASE_CONFIG_PATH
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    return (request, response) => {
        const query = (request.query || {});
        const filename = query.name;
        if (!filename) {
            response.writeHead(200, {});
            response.end('Missing parameters, nothing done!');
            return;
        }
        unlink(`${BASE_IMAGE_PATH}/${filename}`, (err, success) => {
            if (err) {
                response.writeHead(200, {});
                response.end('Error: ' + stringify(err));
                logger.error('Error: ' + stringify(err));
                return;
            }
            const successMsg = stringify(success);
            unlink(`${BASE_CONFIG_PATH}/${filename}.cfg`, (xerr, xsuccess) => {
                if (xerr) {
                    const message = 'Error: ' + stringify(xerr) + ' and success: ' + successMsg;
                    response.writeHead(200, {});
                    response.end(message);
                    logger.error(message);
                    return;
                }

                response.writeHead(200, {});
                response.end('Done! ' + successMsg + ' and ' + stringify(xsuccess));
            });
        });
    };
};
