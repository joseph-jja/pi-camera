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

const videoConfig = [].concat(defaultVideoConfig);
const imageConfig = [].concat(defaultImageConfig);
const CAMERA_CONFIG = getEnvVar('CAMERA_CONFIG');
if (CAMERA_CONFIG) {
    const {
        videoSize
    } = require(`${basedir}/${CAMERA_CONFIG}`);
    videoConfig.forEach(item => {
        if (item.name === 'videoSize') {
            item.values = videoSize;
        }
    });
    imageConfig.forEach(item => {
        if (item.name === 'imageSize') {
            item.values = videoSize;
        }
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
        const imageSizeConfig = results.imageConfig.find(config => {
            return (config.name === 'imageSize');
        });
        if (imageSizeConfig) {
            modes.forEach(item => {
                if (!imageSizeConfig.values.includes(item)) {
                    imageSizeConfig.values.push(item);
                }
            });
            const newConfig = results.imageConfig.map(config => {
                if (config.name === 'imageSize') {
                    config.values = imageSizeConfig.values;
                }
                return config;
            });
            results.imageConfig = newConfig;
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
    } else {
        const rpicamStill = await whichCommand('rpicam-still').catch(errorHandler);
        if (rpicamStill) {
            const executable = await runCommand(rpicamStill, ['--help']).catch(errorHandler);
            if (executable) {
                results.STILL = rpicamStill;
            }
        }
    }
    
    const libcameraVid = await whichCommand('libcamera-vid').catch(errorHandler);
    if (libcameraVid) {
        const executable = await runCommand(libcameraVid, ['--help']).catch(errorHandler);
        if (executable) {
            results.VIDEO = libcameraVid;
        }
    } else {
        const rpicamVid = await whichCommand('rpicam-vid').catch(errorHandler);
        if (rpicamVid) {
            const executable = await runCommand(rpicamVid, ['--help']).catch(errorHandler);
            if (executable) {
                results.VIDEO = rpicamVid;
            }
        }
    }

    if (results.VIDEO) {
        const [err, cameraDetails] = await promiseWrapper(runCommand(results.VIDEO, ['--list-cameras']).catch(errorHandler));
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
    } else {
        const rpicamRaw = await whichCommand('rpicam-raw').catch(errorHandler);
        if (rpicamRaw) {
            const executable = await runCommand(rpicamRaw, ['--help']).catch(errorHandler);
            if (executable) {
                results.RAW_VIDEO = rpicamRaw;
            }
        }
    }
}

async function getVideoStreamCommand() {

    if (hasRun) {
        return results;
    }

    results.imageConfig = imageConfig;
    results.videoConfig = videoConfig;
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
