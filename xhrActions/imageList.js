module.exports = async function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            listImageFiles
        } = require(`${resolveFileLocation}/libs/utils`);

    const formFields = await import('../libs/form.mjs');

    return (request, response) => {

        listImageFiles(`${process.env.HOME}/images/`)
            .then(filedata => {
                if (filedata.hasError) {
                    response.writeHead(500, {
                        'Content-Type': 'text/html'
                    });
                    response.end(stringify(filedata.message));
                    logger.error(`Error ${stringify(filedata.message)}`);
                    return;
                }
                if (filedata.message && filedata.message.length === 0) {
                    response.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    response.end('No files');
                    return;
                }
                const selectData = {
                    name: 'image_list',
                    paramName: '',
                    comment: 'Select an image to delete or download or rename',
                    values: filedata.message
                };
                logger.verbose(`Got select data ${stringify(selectData)}`);
                const htmlForm = formFields.buildSelect(selectData);
                logger.verbose(`Got html form data ${stringify(htmlForm)}`);
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.end(htmlForm);
            }).catch(e => {
                response.writeHead(500, {
                    'Content-Type': 'text/html'
                });
                response.end(stringify(e));
                logger.error(`Error thrown ${stringify(e)}`);
            });
    };
};
