const {
    rename
} = require('fs');

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
        const oldFilename = query.oldname;
        if (!filename || !oldFilename) {
            response.writeHead(200, {});
            response.end('Missing parameters, nothing done!');
            return;
        }
        const newName = oldFilename.replace('capture', filename);
        rename(`${BASE_IMAGE_PATH}/${oldFilename}`, `${BASE_IMAGE_PATH}/${newName}`, (err, success) => {
            if (err) {
                response.writeHead(200, {});
                response.end('Error: ' + stringify(err));
                logger.error('Error: ' + stringify(err));
                return;
            }
            const successMsg = stringify(success);
            rename(`${BASE_CONFIG_PATH}/${oldFilename}.cfg`, `${BASE_CONFIG_PATH}/${newName}.cfg`, (xerr, xsuccess) => {
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
