const {
    rename
} = require('fs');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    {
        OLD_FILENAME_MATCH,
        VALID_CHARACTERS
    } = require(`${basedir}/xhrActions/Constants`),

    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        BASE_IMAGE_PATH,
        BASE_CONFIG_PATH
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    const query = (request.query || {});
    const filename = query.name;
    const oldFilename = query.oldname;
    if (!filename || !oldFilename) {
        response.writeHead(200, {});
        response.end('Missing parameters, nothing done!');
        return;
    }
    const filteredFilename = filename.match(VALID_CHARACTERS).join('');
    const filteredOldFilename = oldFilename.match(OLD_FILENAME_MATCH);
    if (!filteredOldFilename) {
        response.writeHead(200, {});
        response.end('Invalid oldfile name, nothing done!');
        return;
    }
    const firstpart = oldFilename.split('-')[0];
    const newName = oldFilename.replace(firstpart, filteredFilename);
    rename(`${BASE_IMAGE_PATH}/${oldFilename}`, `${BASE_IMAGE_PATH}/${newName}`, (err, _success) => {
        if (err) {
            response.writeHead(200, {});
            response.end('Error: ' + stringify(err));
            logger.error('Error: ' + stringify(err));
            return;
        }
        const successMsg = `File ${oldFilename} renamed to ${newName}`;
        if (oldFilename.endsWith('.dng')) {
            response.writeHead(200, {});
            response.end('Done! ' + successMsg);
            return;
        }
        rename(`${BASE_CONFIG_PATH}/${oldFilename}.cfg`, `${BASE_CONFIG_PATH}/${newName}.cfg`, (xerr, _xsuccess) => {
            if (xerr) {
                const message = 'Error: ' + stringify(xerr) + ' and success: ' + successMsg;
                response.writeHead(200, {});
                response.end(message);
                logger.error(message);
                return;
            }

            const xsuccessMsg = `File ${oldFilename}.cfg renamed to ${newName}.cfg`;
            response.writeHead(200, {});
            response.end('Done! ' + successMsg + ' ' + xsuccessMsg);
        });
    });
};