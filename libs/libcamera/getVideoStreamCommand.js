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

let hasRun = false,
    gstCompleted = false;
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
                    const imageConfig = results.imageConfig.map(item => {
                        if (item.name === 'imageSize') {
                            item.values = cameraSizes.sortedStill;
                        }
                        return item;
                    });
                    data.imageConfig = imageConfig;
                }
                if (cameraSizes.sortedVideo) {
                    const videoConfig = results.videoConfig.map(item => {
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
