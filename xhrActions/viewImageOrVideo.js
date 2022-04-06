const {
    createReadStream,
    readFile
} = require('fs');

const OLD_FILENAME_MATCH = /^[a-zA-Z]*-(\d)*\.[a-z]*$/;

module.exports = function(resolveFileLocation) {

    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
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
        const filteredOldFilename = filename.match(OLD_FILENAME_MATCH);
        if (!filteredOldFilename) {
            response.writeHead(200, {});
            response.end('Invalid oldfile name, nothing done!');
            return;
        }
        if (filename.endsWith('.png')) {
            response.writeHead(200, {});
            readFile(`${BASE_IMAGE_PATH}/${filename}`, (err, data) => {
                
            });
        } else if (filename.endsWith('.mjpeg')) {
            response.writeHead(200, {});
            createReadStream(`${BASE_IMAGE_PATH}/${filename}`).pipe(response);
        } else {
            response.writeHead(200, {});
            response.end('Cannot preview file!');
        }
    };
};