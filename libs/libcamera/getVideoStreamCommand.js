const {
    writeFile
} = require('fs/promises');

const basedir = process.cwd(),
    stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`),
    gstreamer = require(`${basedir}/libs/libcamera/gstreamer`),
    getModes = require(`${basedir}/libs/libcamera/modes`),
    gstreamerProcessor = require(`${basedir}/libs/libcamera/gstreamerProcessor`),
    defaultImageConfig = require(`${basedir}/libs/libcamera/stillConfig`),
    defaultVideoConfig = require(`${basedir}/libs/libcamera/videoConfig`);

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
        const cameraDetails = await runCommand(libcameraVid, ['--list-cameras']).catch(errorHandler);
        if (cameraDetails) {
            await writeFile('/tmp/cameraInfo.txt', cameraDetails);
            const modes = await getModes();
            if (modes) {
                results.modes = modes;
            }
            addVideoModes();
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

function gstChecks() {

    return new Promise(async resolve => {

        const data = {};

        const gresults = await gstreamer();
        logger.debug(`Processed gstreamer ${stringify(gresults)}`);

        if (gresults && gresults.data) {
            const cameraSizes = await gstreamerProcessor();
            logger.debug(`Processed camera sizes ${stringify(cameraSizes)}`);
            if (cameraSizes) {
                if (cameraSizes.sortedStill) {
                    const imageConfig = defaultImageConfig.map(item => {
                        if (item.name === 'imageSize') {
                            item.values = cameraSizes.sortedStill;
                        }
                        return item;
                    });
                    data.imageConfig = imageConfig;
                }
                if (cameraSizes.sortedVideo) {
                    const videoConfig = defaultVideoConfig.map(item => {
                        if (item.name === 'videoSize') {
                            item.values = cameraSizes.sortedVideo;
                        }
                        return item;
                    });
                    data.videoConfig = videoConfig;
                }
            }
        }
        return resolve(data);
    });

}

async function getVideoStreamCommand() {

    if (hasRun && gstCompleted) {
        return results;
    }

    const gresults = await gstChecks();
    if (gresults) {
        results.imageConfig = gresults.imageConfig;
        results.videoConfig = gresults.videoConfig;
        logger.info(`Final results for camera sizes have been updated!`);
        gstCompleted = true;
        logger.debug(`Config ${JSON.stringify(results)}`);
    }

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
