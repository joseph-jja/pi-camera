const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getOptions
    } = require(`${basedir}/libs/utils`),
    {
        setImageUpdateOptions,
        imageStream
    } = require(`${basedir}/libs/videoScripts`);

module.exports = (request, response) => {
    if (request.body && Object.keys(request.body).length > 0) {
        const options = getOptions(request.body);
        if (options.length > 0) {
            setImageUpdateOptions(options);
            imageStream(options, response);
        }
    } else {
        response.writeHead(200, {});
        response.end('No changes applied!');
        logger.info('No image updates applied');
    }
};