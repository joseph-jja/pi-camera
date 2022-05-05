const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`);

const PLATE_SOLVE_DIR = `${process.env.HOME}/solved`;

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

module.exports = async (request, response) => {

    // FIRST convert png to tif
    if (!CONVERT_CMD) {
        response.end('Not implemented yet!');
        logger.error('Could not convert png to tif');
        return;
    }

    if (!CONVERT_CMD) {
        response.end('Not implemented yet!');
        logger.error('Could not convert png to tif');
        return;
    }

    //await runCommand(CONVERT_CMD, ['', '']);
    //convert

    // second run command
    //  solve-field -D PLATE_SOLVE_DIR input-image.tif
    //await runCommand(SOLVE_FIELD_CMD, ['-D', PLATE_SOLVE_DIR, '']);

    response.end('Not implemented yet!');

};
