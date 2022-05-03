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
                return reject(`Command: 'which ${checkCommand}' returned ${code}. Command: ${checkCommand} does not exist!`);
            }
        });
    });
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const commandToRun = (args && Array.isArray(args) ? spawn(command, args) : spawn(command));

        const results = [];

        commandToRun.stdout.on('data', d => {
            if (d && d.length > 0) {
                results.push(d);
            }
        });

        commandToRun.stderr.on('data', d => {
            // command runs but spits our error message so we are ok to run command
            if (d && d.length > 0) {
                results.push(d);
            }
        });


        commandToRun.on('close', (code) => {
            if (results) {
                return resolve(Buffer.concat(results).toString());
            } else {
                return reject(`Command: ${command} exited with code: ${code} and resulted in no output!`);
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
    FFMPEG: undefined
};

async function libcameraChecks() {

    // first check for libcamera
    const libcameraStill = await whichCommand('libcamera-still').catch(errorHandler);
    if (libcameraStill) {
        const executable = await runCommand(libcameraStill, ['--help']).catch(errorHandler);
        if (executable) {
            results.STILL = libcameraStill;
            results.imageConfig = require(`${basedir}/libs/libcamera/stillConfig`);
        }
    }

    const libcameraVid = await whichCommand('libcamera-vid').catch(errorHandler);
    if (libcameraVid) {
        const executable = await runCommand(libcameraVid, ['--help']).catch(errorHandler);
        if (executable) {
            results.VIDEO = libcameraVid;
            results.videoConfig = require(`${basedir}/libs/libcamera/videoConfig`);
        }
    }
}

async function raspiChecks() {

    if (!results.STILL) {
        // first check for libcamera
        const raspistill = await whichCommand('raspistill').catch(errorHandler);
        if (raspistill) {
            const executable = await runCommand('raspistill', ['--help']).catch(errorHandler);
            if (executable) {
                results.STILL = raspistill;
                results.imageConfig = require(`${basedir}/libs/libcamera/rstillConfig`);
            }
        }
    }

    if (!results.VIDEO) {
        // first check for libcamera
        const raspivid = await whichCommand('raspivid').catch(errorHandler);
        if (raspivid) {
            const executable = await runCommand(raspivid, ['--help']).catch(errorHandler);
            if (executable) {
                results.VIDEO = raspivid;
                results.videoConfig = require(`${basedir}/libs/libcamera/rvideoConfig`);
            }
        }
    }
}

async function getVideoStreamCommand() {

    if (hasRun) {
        return results;
    }

    await libcameraChecks();

    await raspiChecks();

    const ffmpeg = await whichCommand('ffmpeg').catch(errorHandler);
    if (ffmpeg) {
        const executable = await runCommand('ffmpeg', ['--help']).catch(errorHandler);
        if (executable) {
            results.FFMPEG = ffmpeg;
        }
    }

    hasRun = true;

    return results;
}

module.exports = getVideoStreamCommand;
