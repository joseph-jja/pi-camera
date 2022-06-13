const {
    unlink
} = require('fs');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    {
        OLD_FILENAME_MATCH
    } = require(`${basedir}/xhrActions/Constants`),

    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        BASE_IMAGE_PATH,
        BASE_CONFIG_PATH
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    const query = (request.query || {});
    const filename = query.name;
    if (!filename) {
        response.writeHead(200, {});
        response.end('Missing parameters, nothing done!');
        return;
    }
    const filteredOldFilename = filename.match(OLD_FILENAME_MATCH);
    if (!filteredOldFilename) {
        response.writeHead(200, {});
        response.end('Invalid oldfile name, nothing done!');
        return;
    }
    unlink(`${BASE_IMAGE_PATH}/${filename}`, (err, _success) => {
        if (err) {
            response.writeHead(200, {});
            response.end('Error: ' + stringify(err));
            logger.error('Error: ' + stringify(err));
            return;
        }
        const successMsg = `File ${filename} deleted!`;
        if (filename.endsWith('.dng')) {
            response.writeHead(200, {});
            response.end('Done! ' + successMsg);
            return;
        }
        unlink(`${BASE_CONFIG_PATH}/${filename}.cfg`, (xerr, _xsuccess) => {
            if (xerr) {
                const message = 'Error: ' + stringify(xerr) + ' and success: ' + successMsg;
                response.writeHead(200, {});
                response.end(message);
                logger.error(message);
                return;
            }

            const xsuccessMsg = `File ${filename}.cfg deleted!`;
            response.writeHead(200, {});
            response.end('Done! ' + successMsg + ' ' + xsuccessMsg);
        });
    });
};
