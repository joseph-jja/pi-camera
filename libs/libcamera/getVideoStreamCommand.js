const {
    writeFile
} = require('fs').promises;

const basedir = process.cwd(),
    promiseWrapper = require(`${basedir}/libs/PromiseWrapper`),
    stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`),
    { getEnvVar } = require(`${basedir}/libs/env`),
    getModes = require(`${basedir}/libs/libcamera/modes`),
    defaultImageConfig = require(`${basedir}/libs/libcamera/stillConfig`),
    defaultVideoConfig = require(`${basedir}/libs/libcamera/videoConfig`);

const CAMERA_CONFIG = getEnvVar('CAMERA_CONFIG', {
    videoSize: [
        '--width 640 --height 480'
        '--width 800 --height 600',
        '--width 1280 --height 720',
        '--width 1920 --height 1080',
    ]
});

function errorHandler(e) {
    logger.error(e);
    return Promise.resolve();
}

let hasRun = false,
    gstCompleted = false;
const results = {
    STILL: undefined,
    imageConfig: undefined,
    VIDEO: undefined,
    RAW_VIDEO: undefined,
    videoConfig: undefined,
    FFMPEG: undefined,
    modes: undefined
};

function addVideoModes() {

    if (results.modes && Object.keys(results.modes) && Object.keys(results.modes).length > 0 && results.videoConfig) {
        // converts the modes object to an array of something for resolutions
        const key = Object.keys(results.modes)[0];
        const modes = results.modes[key].modes.map(item => {
            return `--width ${item.resX} --height ${item.resY}`;
        });
        // find the videoSizes 
        const videoSizeConfig = results.videoConfig.find(config => {
            return (config.name === 'videoSize');
        });
        if (videoSizeConfig) {
            modes.forEach(item => {
                if (!videoSizeConfig.values.includes(item)) {
                    videoSizeConfig.values.push(item);
                }
            });
            const newConfig = results.videoConfig.map(config => {
                if (config.name === 'videoSize') {
                    config.values = videoSizeConfig.values;
                }
                return config;
            });
            results.videoConfig = newConfig;
        }
    }
}

async function libcameraChecks() {

    // first check for libcamera
    const libcameraStill = await whichCommand('libcamera-still').catch(errorHandler);
    if (libcameraStill) {
        const executable = await runCommand(libcameraStill, ['--help']).catch(errorHandler);
        if (executable) {
            results.STILL = libcameraStill;
        }
    }

    const libcameraVid = await whichCommand('libcamera-vid').catch(errorHandler);
    if (libcameraVid) {
        const executable = await runCommand(libcameraVid, ['--help']).catch(errorHandler);
        if (executable) {
            results.VIDEO = libcameraVid;
        }
        const [err, cameraDetails] = await promiseWrapper(runCommand(libcameraVid, ['--list-cameras']).catch(errorHandler));
        if (cameraDetails) {
            await writeFile('/tmp/cameraInfo.txt', cameraDetails);
            const modes = await getModes();
            if (modes) {
                results.modes = modes;
            }
            addVideoModes();
        } else if (err) {
            logger.error(stringify(err));
        }
    }

    const libcameraRaw = await whichCommand('libcamera-raw').catch(errorHandler);
    if (libcameraRaw) {
        const executable = await runCommand(libcameraRaw, ['--help']).catch(errorHandler);
        if (executable) {
            results.RAW_VIDEO = libcameraRaw;
        }
    }
}

async function getVideoStreamCommand() {

    if (hasRun) {
        return results;
    }

    results.imageConfig = CAMERA_CONFIG.videoSize;
    results.videoConfig = CAMERA_CONFIG.videoSize;
    logger.info(`Final results for camera sizes have been updated!`);
    logger.debug(`Config ${JSON.stringify(results)}`);

    await libcameraChecks();

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
