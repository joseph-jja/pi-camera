const fs = require('fs');

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
        response.writeHead(200, {});
        response.end('Done!');
    };
};
