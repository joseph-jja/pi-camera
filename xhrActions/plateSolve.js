const {
    mkdirSync,
    statSync
} = require('fs');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`),
    {
        BASE_IMAGE_PATH
    } = require(`${basedir}/libs/videoScripts`),
    {
        OLD_FILENAME_MATCH
    } = require(`${basedir}/xhrActions/Constants`);

const PLATE_SOLVE_DIR = `${process.env.HOME}/solved`,
    PLATE_SOLVE_IN_DIR = `${process.env.HOME}/plate-solve-in`;

let SOLVE_FIELD_CMD,
    CONVERT_CMD;

function errorHandler(err) {
    logger.error(err);
    Promise.resolve();
}

async function findCommands() {

    CONVERT_CMD = await whichCommand('convert').catch(errorHandler);

    SOLVE_FIELD_CMD = await whichCommand('solve-field').catch(errorHandler);
}

findCommands();

let exists = false;

function initDir() {

    // first time system starts and this function is accessed we will create dir
    // but we don't need to do this on every request
    if (exists) {
        return;
    }

    try {
        // dir exixts we skip trying to make it again
        const stats = statSync(PLATE_SOLVE_IN_DIR);
        if (stats) {
            exists = true;
            return;
        }
    } catch (e) {
        logger.verbose(e);
    }

    try {
        mkdirSync(PLATE_SOLVE_IN_DIR);
    } catch (e) {
        logger.verbose(e);
    }
}

module.exports = async (request, response) => {

    // FIRST convert jpg to tif
    if (!CONVERT_CMD) {
        response.end('The convert command was not found!');
        return;
    }

    if (!SOLVE_FIELD_CMD) {
        response.end('The solve-field command was not found!');
        return;
    }

    initDir();

    const query = (request.query || {});
    const filename = query.name;
    if (!filename) {
        response.writeHead(200, {});
        response.end('Missing parameters, nothing done!');
        logger.info('Missing parameters, nothing done!');
        return;
    }
    const filteredOldFilename = filename.match(OLD_FILENAME_MATCH);
    if (!filteredOldFilename || !filename.endsWith('.jpg')) {
        response.writeHead(200, {});
        response.end('Invalid oldfile name, nothing done!');
        logger.info('Invalid oldfile name, nothing done!');
        return;
    }

    // run convert to change to tiff
    const tifFilename = `${PLATE_SOLVE_IN_DIR}/${filename.replace('.jpg', '.tif')}`;
    runCommand(CONVERT_CMD, [`${BASE_IMAGE_PATH}/${filename}`, tifFilename]).then(() => {
        runCommand(SOLVE_FIELD_CMD, ['-O', '-D', PLATE_SOLVE_DIR, tifFilename]).then(msg => {
            logger.verbose(`Plate solved ${stringify(msg)}`);
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end(`Plate solved ${stringify(msg)}`);
        }).catch(e => {
            response.writeHead(500, {
                'Content-Type': 'text/html'
            });
            response.end(stringify(e));
            logger.error(`Error thrown ${stringify(e)}`);
        });
    }).catch(e => {
        response.writeHead(500, {
            'Content-Type': 'text/html'
        });
        response.end(stringify(e));
        logger.error(`Error thrown ${stringify(e)}`);
    });
};
