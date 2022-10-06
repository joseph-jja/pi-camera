const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`),
    gstreamer = require(`${basedir}/libs/libcamera/gstreamer`);

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

    await gstreamer();

    hasRun = true;

    return results;
}

module.exports = getVideoStreamCommand;
