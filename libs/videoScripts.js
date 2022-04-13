const fs = require('fs');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    {
        padNumber,
        getH264Bitrate
    } = require(`${basedir}/libs/utils`),
    NullStream = require(`${basedir}/libs/NullStream.js`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getImageUpdateOptions,
        setImageUpdateOptions,
        streamJpeg,
        saveImage
    } = require(`${basedir}/libs/libcamera/still`),
    {
        getVideoUpdateOptions,
        setVideoUpdateOptions,
        streamMjpeg,
        saveH264,
        saveMjpeg
    } = require(`${basedir}/libs/libcamera/video`),
    {
        getFfmpegStream
    } = require(`${basedir}/libs/ffmpeg`);

global.libcameraProcess;
global.directStreamProcess;
global.imageStreamProcess;
global.previewProcessMap = {};

const BASE_IMAGE_PATH = `${process.env.HOME}/images`,
    BASE_CONFIG_PATH = `${process.env.HOME}/imageConfig`;

function initSystem() {
    try {
        fs.mkdirSync(BASE_IMAGE_PATH);
    } catch (e) {
        logger.verbose(e);
    }
    try {
        fs.mkdirSync(BASE_CONFIG_PATH);
    } catch (e) {
        logger.verbose(e);
    }
}

function removeListeners(streamObject) {
    if (streamObject && streamObject.stdout) {
        if (streamObject.stdout.listeners('data')) {
            const listeners = streamObject.stdout.listeners('data');
            for (let i = 0, end = listeners.length; i < end; i++) {
                streamObject.stdout.removeListener('data', listeners[i]);
            }
        }
        if (streamObject.stderr.listeners('data')) {
            const listeners = streamObject.stderr.listeners('data');
            for (let i = 0, end = listeners.length; i < end; i++) {
                streamObject.stderr.removeListener('data', listeners[i]);
            }
        }
        try {
            streamObject.stdout.unpipe();
        } catch (e) {
            // do we care?
        }
    }
}



initSystem();

function killAllRunning() {

    const previews = Object.keys(global.previewProcessMap).filter(key => {
        return (global.previewProcessMap[key] && global.previewProcessMap[key].pid);
    });

    const streams = [
        global.directStreamProcess,
        global.libcameraProcess,
        global.imageStreamProcess
    ].filter(stream => {
        return (stream && stream.pid);
    });
    const results = previews.concat(streams).map(stream => {
        removeListeners(stream);
        stream.once('close', () => {
            logger.info(`Process: ${stream.pid} ended`);
        });
        stream.kill('SIGKILL');
        return stream.pid;
    });

    return results;
}

function getVideoFilename(ext = 'mjpeg') {
    const now = new Date();
    const datePart = `${now.getFullYear()}${padNumber(now.getMonth()+1)}${padNumber(now.getDate())}`;
    const timePart = `${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}`;
    return `capture-${datePart}${timePart}.${ext}`;
}

function saveConfig(options, ext = 'mjpeg') {

    const filename = `${BASE_CONFIG_PATH}/${getVideoFilename(ext + '.cfg')}`;
    fs.writeFile(filename, options, (err, res) => {
        if (err) {
            logger.error(stringify(err));
        } else {
            logger.verbose(stringify(res));
        }
    });
}

function saveRawVideoData(options = [], response, videoConfig) {

    const optionsStr = options.join(' ');
    const bitRate = getH264Bitrate(videoConfig, optionsStr);
    const spawnOptions = options.concat();
    if (bitRate && bitRate.length > 0) {
        bitRate.split(' ').forEach(x => {
            spawnOptions.push(x);
        });
    }
    const filename = `${BASE_IMAGE_PATH}/${getVideoFilename('h264')}`;
    spawnOptions.push('-o');
    spawnOptions.push(filename);
    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    global.libcameraProcess = undefined;
    global.directStreamProcess = undefined;
    global.imageStreamProcess = undefined;

    const rawDataProcess = saveH264(spawnOptions);
    rawDataProcess.on('close', (code) => {
        response.writeHead(200, {});
        response.end(`Saved raw data with status code ${code} using options ${stringify(spawnOptions)}.`);
    });
    saveConfig(stringify(spawnOptions), 'h264');
}

function saveImagesData(options = [], response) {

    const spawnOptions = options.concat();

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    global.libcameraProcess = undefined;
    global.directStreamProcess = undefined;
    global.imageStreamProcess = undefined;

    const filename = `${BASE_IMAGE_PATH}/${getVideoFilename('png')}`;
    spawnOptions.push('-o');
    spawnOptions.push(filename);
    const imageDataProcess = saveImage(spawnOptions);
    imageDataProcess.on('close', (code) => {
        response.writeHead(200, {});
        response.end(`Saved image data with status code ${code} using options ${stringify(spawnOptions)}.`);
    });
    logger.info(`Saving image with options: ${stringify(spawnOptions)}`);
    saveConfig(stringify(spawnOptions), 'png');
}

function imageStream(options = []) {

    const spawnOptions = (options.length > 0 ? options : getImageUpdateOptions()).concat();

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    global.libcameraProcess = undefined;
    global.directStreamProcess = undefined;

    global.imageStreamProcess = streamJpeg(options);

    const DevNull = new NullStream();
    global.imageStreamProcess.stdout.pipe(DevNull);
    global.imageStreamProcess.stderr.on('error', (err) => {
        logger.debug(`Error ${err.length}`);
    });

    logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)}...`);
}

function directStream(options = []) {

    const spawnOptions = (options.length > 0 ? options : getVideoUpdateOptions()).concat();

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    global.imageStreamProcess = undefined;
    // stream libcamera stdout to ffmpeg stdin
    global.libcameraProcess = streamMjpeg(spawnOptions);
    global.directStreamProcess = getFfmpegStream();

    const DevNull = new NullStream();
    global.directStreamProcess.stdout.on('data', d => {
        DevNull.write(d);
    });
    global.libcameraProcess.stdout.on('data', d => {
        global.directStreamProcess.stdin.write(d);
    });

    global.directStreamProcess.stderr.on('data', (err) => {
        logger.debug(`Error ${err.length}`);
    });
    global.libcameraProcess.stderr.on('data', (err) => {
        logger.debug(`Error ${err.length}`);
    });
    logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)} pids ${global.libcameraProcess.pid} ${global.directStreamProcess.pid}`);
}

function saveVideoProcess(options = [], response) {

    const filename = `${BASE_IMAGE_PATH}/${getVideoFilename()}`;

    const spawnOptions = options.concat();
    spawnOptions.push('-o');
    spawnOptions.push(filename);

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    global.libcameraProcess = undefined;
    global.directStreamProcess = undefined;
    global.imageStreamProcess = undefined;

    const mjpegDataProcess = saveMjpeg(spawnOptions);
    mjpegDataProcess.on('close', (code) => {
        response.writeHead(200, {});
        response.end(`Finished with code ${code} using options ${stringify(spawnOptions)}.`);
    });
    saveConfig(stringify(spawnOptions), 'h264');
    saveConfig(stringify(options));
}

function cleanupPreviewNodes(uuid, streamObject) {
    try {
        //streamObject.stdout.unpipe(global.previewProcessMap[uuid].stdin);
    } catch (e) {
        logger.error(`Unpipe stdout error ${stringify(e)}`);
    }
    try {
        global.previewProcessMap[uuid].stdout.unpipe();
    } catch (e) {
        logger.error(`Unpipe preview process error ${stringify(e)}`);
    }
    try {
        streamObject.stdout.once('close', () => {
            logger.info('Preview stream closed!');
        });
        global.previewProcessMap[uuid].kill('SIGKILL');
    } catch (e) {
        logger.error(`kill error ${stringify(e)}`);
    }
    try {
        global.previewProcessMap[uuid] = undefined;
    } catch (e) {
        logger.error(`Undef error ${stringify(e)}`);
    }
};

module.exports = {
    BASE_IMAGE_PATH,
    BASE_CONFIG_PATH,
    getVideoFilename,
    saveRawVideoData,
    saveImagesData,
    directStream,
    imageStream,
    saveVideoProcess,
    getVideoUpdateOptions,
    setVideoUpdateOptions,
    getImageUpdateOptions,
    setImageUpdateOptions,
    cleanupPreviewNodes
};
