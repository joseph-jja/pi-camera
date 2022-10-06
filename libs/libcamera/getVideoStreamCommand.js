const {
    createWriteStream
} = require('fs');

const basedir = process.cwd(),
    stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        whichCommand,
        runCommand
    } = require(`${basedir}/libs/spawnUtils`),
    gstreamer = require(`${basedir}/libs/libcamera/gstreamer`),
    gstreamerProcessor = require(`${basedir}/libs/libcamera/gstreamerProcessor`),
    defaultImageConfig = require(`${basedir}/libs/libcamera/stillConfig`),
    defaultVideoConfig = require(`${basedir}/libs/libcamera/videoConfig`);

function errorHandler(e) {
    logger.error(e);
    return Promise.resolve();
}

let hasRun = false;
const results = {
    STILL: undefined,
    imageConfig: defaultImageConfig,
    VIDEO: undefined,
    videoConfig: defaultVideoConfig,
    FFMPEG: undefined
};

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
            const handle = createWriteStream('/tmp/cameraInfo.txt');
            handle.write(cameraDetails);
        }
    }
}

function getVideoStreamCommand() {

    return new Promise(async resolve => {

        if (hasRun) {
            return results;
        }

        await libcameraChecks();

        const ffmpeg = await whichCommand('ffmpeg').catch(errorHandler);
        if (ffmpeg) {
            const executable = await runCommand('ffmpeg', ['--help']).catch(errorHandler);
            if (executable) {
                results.FFMPEG = ffmpeg;
            }
        }

        const gresults = await gstreamer();
        logger.debug(`Processed gstreamer ${stringify(gresults)}`);
        if (gresults && gresults.data) {
            const cameraSizes = await gstreamerProcessor();
            logger.debug(`Processed camera sizes ${stringify(cameraSizes)}`);
            if (cameraSizes) {
                if (cameraSizes.sortedStill) {
                    const imageConfig = results.imageConfig.map(item => {
                        if (item.name === 'imageSize') {
                            item.values = cameraSizes.sortedStill;
                        }
                        return item;
                    });
                    results.imageConfig = imageConfig;
                    logger.info(`Final results for camera sizes ${stringify(imageConfig)}`);
                }
                if (cameraSizes.sortedVideo) {
                    const videoConfig = results.videoConfig.map(item => {
                        if (item.name === 'videoSize') {
                            item.values = cameraSizes.sortedVideo;
                        }
                        return item;
                    });
                    results.videoConfig = videoConfig;
                }
            }
        }

        hasRun = true;

        return resolve(results);
    });
}

module.exports = getVideoStreamCommand;
