const spawn = require('child_process').spawn;

const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename);

function whichCommand(checkCommand) {
    return new Promise((resolve, reject) => {
        const whichCmd = spawn('which', [checkCommand]);

        let commandPath;

        whichCmd.stdout.on('data', d => {
            if (d && d.length > 0) {
                commandPath = d.toString().trim().replace(/\/\//g, '/');
            }
        });

        whichCmd.stderr.on('data', d => {
            return reject((d || '').toString());
        });


        whichCmd.on('close', (code) => {
            if (commandPath) {
                return resolve(commandPath);
            } else {
                return reject(`Command: ${checkCommand} does not exist! 'which ${check Command}' returned ${code}`);
            }
        });
    });
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const commandToRun = ( args && Array.isArray(args) ? spawn(command, args) : spawn(command) );

        let results;

        commandToRun.stdout.on('data', d => {
            if (d && d.length > 0) {
                results = d.toString().trim();
            }
        });

        commandToRun.stderr.on('data', d => {
            // command runs but spits our error message so we are ok to run command
            if (d && d.length > 0) {
                results = d.toString().trim();
            }
        });


        commandToRun.on('close', () => {
            if (results) {
                return resolve(results);
            } else {
                return reject(`No output from command: ${command}!`);
            }
        });

    });
}

function errorHandler(e) {
    logger.error(e);
    return Promise.resolve();
}

let hasRun = false;
const results = {
    STILL: undefined,
    imageConfig: undefined,
    VIDEO: undefined,
    videoConfig: undefined,
    FFMPEG: undefined,
};


async function getVideoStreamCommand() {

    if (hasRun) {
        return results;
    }

    // first check for libcamera 
    const libcameraStill = await whichCommand('libcamera-still').catch(errorHandler);
    if (libcameraStill) {
        const executable = await runCommand(libcameraStill, [ '--help' ]).catch(errorHandler);
        if (executable) {
            results.STILL = libcameraStill;
            results.imageConfig = require(`${basedir}/libs/libcamera/stillConfig`);
        }
    }

    const libcameraVid = await whichCommand('libcamera-vid').catch(errorHandler);
    if (libcameraVid) {
        const executable = await runCommand(libcameraVid, [ '--help' ]).catch(errorHandler);
        if (executable) {
            results.VIDEO = libcameraVid;
            results.videoConfig = require(`${basedir}/libs/libcamera/videoConfig`);
        }
    }

    if (!libcameraStill) {
        // first check for libcamera 
        const raspistill = await whichCommand('raspistill').catch(errorHandler);
        if (raspistill) {
            const executable = await runCommand('raspistill', [ '--help' ]).catch(errorHandler);
            if (executable) {
                results.STILL = raspistill;
                results.imageConfig = require(`${basedir}/libs/libcamera/rstillConfig`);
            }
        }
    }

    if (!libcameraVid) {
        // first check for libcamera 
        const raspivid = await whichCommand('raspivid').catch(errorHandler);
        if (raspivid) {
            const executable = await runCommand(raspivid, [ '--help' ]).catch(errorHandler);
            if (executable) {
                results.VIDEO = raspivid;
                results.videoConfig = require(`${basedir}/libs/libcamera/rvideoConfig`);
            }
        }
    }

    const ffmpeg = await whichCommand('ffmpeg').catch(errorHandler);
    if (ffmpeg) {
        const executable = await runCommand('ffmpeg', [ '--help' ]).catch(errorHandler);
        if (executable) {
            results.FFMPEG = ffmpeg;
        }
    }

    hasRun = true;

    return results;
}

module.exports = getVideoStreamCommand;
