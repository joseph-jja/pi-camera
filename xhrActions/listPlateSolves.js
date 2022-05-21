const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        listImageFiles
    } = require(`${basedir}/libs/utils`);

const PLATE_SOLVE_DIR = `${process.env.HOME}/solved`;

module.exports = async (request, response, formFields) => {

    listImageFiles(PLATE_SOLVE_DIR)
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
                name: 'plate_solved',
                paramName: '',
                comment: 'View solved file',
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
