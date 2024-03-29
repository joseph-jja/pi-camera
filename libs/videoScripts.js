const fs = require('fs'),
    os = require('os'),
    EventEmitter = require('events');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    getEnvVar = require(`${basedir}/libs/env`).getEnvVar,
    {
        padNumber,
        getH264Bitrate
    } = require(`${basedir}/libs/utils`),
    NullStream = require(`${basedir}/libs/NullStream.js`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getImageUpdateOptions,
        setImageUpdateOptions,
        imageTest,
        saveImage,
        initStill
    } = require(`${basedir}/libs/libcamera/still`),
    {
        getVideoUpdateOptions,
        setVideoUpdateOptions,
        streamMjpeg,
        saveVideo,
        initVideo
    } = require(`${basedir}/libs/libcamera/video`),
    {
        initFfmpeg,
        getFfmpegStream,
        playFile,
        //captureImageFromFfmpegStream,
        getFfmpegWebmStream
    } = require(`${basedir}/libs/ffmpeg`),
    {
        VALID_CHARACTERS
    } = require(`${basedir}/xhrActions/Constants`);

let libcameraProcess,
    directStreamProcess,
    imageStreamProcess,
    playbackStream;

const ffmpegStreamFunction = getEnvVar('STREAM_WEBM') ? getFfmpegWebmStream : getFfmpegStream;

const BASE_IMAGE_PATH = `${process.env.HOME}/images`,
    BASE_CONFIG_PATH = `${process.env.HOME}/imageConfig`,
    SOLVED_INFO_PATH = `${process.env.HOME}/solvesInfo`,
    HISTOGRAM_CONFIG_PATH = `${process.env.HOME}/histograms`;

class CaptureProcessEmitter extends EventEmitter {
    constructor() {
        super();
        this.count = 0;
    }

    add() {
        this.count++;
    }

    remove() {
        this.count--;
    }
}

const captureEmitter = new CaptureProcessEmitter();

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
    try {
        fs.mkdirSync(HISTOGRAM_CONFIG_PATH);
    } catch (e) {
        logger.verbose(e);
    }
    try {
        fs.mkdirSync(SOLVED_INFO_PATH);
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
    }
}

initSystem();

function getLibcameraProcess() {
    return libcameraProcess;
}

function getDirectStreamProcesss() {
    return directStreamProcess;
}

function unsetDirectStreamProcesss() {
    directStreamProcess = undefined;
}

function getImageStreamProcess() {
    return imageStreamProcess;
}

function setImageStreamProcess(value) {
    imageStreamProcess = value;
}

function killAllRunning() {

    const streams = [
        directStreamProcess,
        libcameraProcess,
        imageStreamProcess,
        playbackStream
    ].filter(stream => {
        return (stream && stream.pid);
    });
    const results = streams.map(stream => {
        removeListeners(stream);
        stream.once('close', () => {
            logger.info(`Process: ${stream.pid} ended`);
        });
        stream.stdout.destroy();
        stream.stdin.destroy();
        stream.stderr.destroy();
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

function saveConfig(options, captureFilename) {

    const filename = `${BASE_CONFIG_PATH}/${captureFilename}.cfg`;
    fs.writeFile(filename, `${options}${os.EOL}`, (err, res) => {
        if (err) {
            logger.error(stringify(err));
        } else {
            logger.verbose(stringify(res));
        }
    });
}

function callSaveImage(options, count, total, saveFilename, callback) {

    const spawnOptions = options.concat();
    const basefilename = saveFilename ?
        getVideoFilename('png').replace('capture', saveFilename) :
        getVideoFilename('png');
    const filename = `${BASE_IMAGE_PATH}/${basefilename}`;
    spawnOptions.push('-o');
    spawnOptions.push(filename);

    logger.info(`Saving image with options: ${stringify(spawnOptions)}`);

    saveConfig(stringify(spawnOptions), basefilename);
    const imageDataProcess = saveImage(spawnOptions);
    imageDataProcess.on('close', code => {
        const nextCount = count + 1;
        captureEmitter.emit('button-exec', {
            method: 'saveImagesData',
            status: `Saved a total of ${nextCount} images of ${total} with code ${code}`
        });
        if (nextCount < total) {
            callSaveImage(options, nextCount, total, saveFilename, callback);
        } else {
            callback(code);
        }
    });
    imageDataProcess.on('error', (err) => {
        const errorMsg = `ERROR: ${stringify(err)}`;
        logger.error(errorMsg);
        captureEmitter.emit('button-exec', {
            method: 'saveImagesData',
            status: errorMsg
        });
    });
}

function saveImagesData(request, response) {

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    libcameraProcess = undefined;
    directStreamProcess = undefined;
    imageStreamProcess = undefined;

    const queryOptions = (request.query || {});

    const options = getImageUpdateOptions();
    const total = queryOptions.imagecount || 1;

    const spawnOptions = options.concat();

    // no preview for saving 
    if (queryOptions.preview && decodeURIComponent(queryOptions.preview) === '--nopreview') {
        spawnOptions.push('--nopreview');
    }

    const callback = (code) => {
        response.writeHead(200, {});
        response.end(`Finished with code ${code} using options ${stringify(spawnOptions)}.`);
        captureEmitter.emit('button-exec', {
            method: 'saveImagesData',
            status: `Saved a total of ${total} images`
        });
        directStream(getVideoUpdateOptions());
    };

    // filename that they want these saved as
    let saveFilename = queryOptions.saveFilename || undefined;
    if (saveFilename) {
        saveFilename = saveFilename.match(VALID_CHARACTERS).join('');
    }
    
    const count = 0;
    callSaveImage(options, count, total, saveFilename, callback);

    captureEmitter.emit('button-exec', {
        method: 'saveImagesData',
        status: 'running save images'
    });
}

const errorHandler = (err) => {
    logger.debug(`Error ${err.length}`);
};

function imageStream(options = [], response) {

    const spawnOptions = (options.length > 0 ? options : getImageUpdateOptions()).concat();

    const running = killAllRunning();
    logger.info('ImageStream: Results of stopping all: ' + stringify(running));

    libcameraProcess = undefined;
    directStreamProcess = undefined;

    imageStreamProcess = imageTest(spawnOptions);

    imageStreamProcess.stderr.on('error', errorHandler);

    imageStreamProcess.on('close', (code) => {
        response.writeHead(200, {});
        response.end(`Options set resulted in code ${code} using options ${stringify(spawnOptions)} on ${new Date()}.`);
        captureEmitter.emit('button-exec', {
            method: 'imageStream',
            status: `Image stream completed with code ${code}`
        });
        // after the test continue video streaming until image capture :)
        directStream(getVideoUpdateOptions());
    });

    logger.info(`Testing still capture options from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)} pid ${imageStreamProcess.pid}`);

    captureEmitter.emit('button-exec', {
        method: 'imageStream',
        status: 'image stream test running'
    });
}

let initialized = false;

async function directStream(options = []) {

    if (!initialized) {
        await initStill();
        await initVideo();
        await initFfmpeg();
        initialized = true;
    }

    const spawnOptions = (options.length > 0 ? options : getVideoUpdateOptions()).concat();

    const running = killAllRunning();
    logger.info('VideoStream: Results of stopping all: ' + stringify(running));

    const index = spawnOptions.indexOf('--framerate');
    const ffmpegFramerate = (index > -1 ? spawnOptions[index + 1] : 4);

    imageStreamProcess = undefined;
    // stream libcamera stdout to ffmpeg stdin
    libcameraProcess = await streamMjpeg(spawnOptions);
    if (!libcameraProcess) {
        logger.error('No streaming abilities found, will do nothing!');
        return;
    }

    directStreamProcess = ffmpegStreamFunction(ffmpegFramerate);

    const DevNull = new NullStream();
    directStreamProcess.stdout.pipe(DevNull);
    libcameraProcess.stdout.pipe(directStreamProcess.stdin);

    directStreamProcess.stderr.on('data', errorHandler);
    libcameraProcess.stderr.on('data', errorHandler);
    logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)} pids ${libcameraProcess.pid} ${directStreamProcess.pid}`);

    captureEmitter.emit('button-exec', {
        method: 'directStream',
        status: 'preview is enabled'
    });
}

const MJPEG_CODEC = 'mjpeg',
    H264_CODEC = 'h264',
    YUV420_CODEC = 'yuv420',
    LIBAV_H264_CODEC = 'libavh264',
    LIBAV_MJPEGTS_CODEC = 'mjpegts',
    LIBAV_AVI_CODEC = 'avi';

function saveVideoData(codec, options = [], request, response, videoConfig) {

    const spawnOptions = options.concat();

    // no preview for saving 
    if (request.query.preview && decodeURIComponent(request.query.preview) === '--nopreview') {
        spawnOptions.push('--nopreview');
    }

    spawnOptions.push('--lores-width');
    spawnOptions.push(0);
    spawnOptions.push('--lores-height');
    spawnOptions.push(0);

    // need to set bitrates to get any decent images for h264 or avi
    const captureOptions = options.join(' ');
    const bitRate = getH264Bitrate(videoConfig, captureOptions);
    if (bitRate && bitRate.length > 0) {
        bitRate.split(' ').forEach(x => {
            spawnOptions.push(x);
        });
    }

    let extension = MJPEG_CODEC;
    switch (codec) {
    case H264_CODEC:
        extension = H264_CODEC;
        spawnOptions.push('--codec');
        spawnOptions.push('h264');
        break;
    case LIBAV_H264_CODEC:
        extension = 'h264';
        spawnOptions.push('--codec');
        spawnOptions.push('libav');
        spawnOptions.push('--libav-format');
        spawnOptions.push('h264');
        break;
    case LIBAV_AVI_CODEC:
        extension = 'avi';
        spawnOptions.push('--codec');
        spawnOptions.push('libav');
        spawnOptions.push('--libav-format');
        spawnOptions.push('avi');
        spawnOptions.push('--quality');
        spawnOptions.push(100);
        break;
    case YUV420_CODEC:
        extension = 'yuv';
        spawnOptions.push('--codec');
        spawnOptions.push('libav');
        spawnOptions.push('--quality');
        spawnOptions.push(100);
        break;
    case LIBAV_MJPEGTS_CODEC:
        extension = 'ts';
        spawnOptions.push('--codec');
        spawnOptions.push('libav');
        spawnOptions.push('--libav-format');
        spawnOptions.push('mpegts');
        spawnOptions.push('--quality');
        spawnOptions.push(100);
        break;
    default:
        extension = MJPEG_CODEC;
        spawnOptions.push('--codec');
        spawnOptions.push('libav');
        spawnOptions.push('--libav-format');
        spawnOptions.push('mjpeg');
        spawnOptions.push('--quality');
        spawnOptions.push(100);
        break;
    }

    const queryOptions = (request.query || {});

    // filename that they want these saved as
    let saveFilename = queryOptions.saveFilename || undefined;
    if (saveFilename) {
        saveFilename = saveFilename.match(VALID_CHARACTERS).join('');
    }
    const basefilename = saveFilename ?
        getVideoFilename(extension).replace('capture', saveFilename) :
        getVideoFilename(extension);
    const filename = `${BASE_IMAGE_PATH}/${basefilename}`;

    spawnOptions.push('-o');
    spawnOptions.push(filename);

    const recordingTime = queryOptions.recordingTime || 60000;
    const recordTimeIndex = spawnOptions.indexOf('t');
    if (recordTimeIndex > -1) {
        spawnOptions[recordTimeIndex + 1] = recordingTime;
    } else {
        spawnOptions.push('-t');
        spawnOptions.push(recordingTime);
    }

    if (spawnOptions.indexOf('-t') < 0) {
        spawnOptions.push('-t');
        spawnOptions.push(60000);
    }

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    libcameraProcess = undefined;
    directStreamProcess = undefined;
    imageStreamProcess = undefined;

    const saveDataProcess = saveVideo(spawnOptions);
    const logData = [];
    saveDataProcess.on('close', (code) => {
        response.writeHead(200, {});
        response.end(`Finished with code ${code} using codeec ${codec} with options ${stringify(spawnOptions)}.`);
        captureEmitter.emit('button-exec', {
            method: 'saveVideoData',
            status: `running save ${codec} completed`
        });
        // after the test continue video streaming until image capture :)
        const saveSpawnOptions = spawnOptions.concat(logData);
        saveConfig(stringify(saveSpawnOptions), basefilename);
        directStream(getVideoUpdateOptions());
    });
    saveDataProcess.on('error', (err) => {
        const errorMsg = `ERROR: ${stringify(err)}`;
        logger.error(errorMsg);
        captureEmitter.emit('button-exec', {
            method: 'saveVideoData',
            status: errorMsg
        });
    });

    captureEmitter.emit('button-exec', {
        method: 'saveVideoData',
        status: `running save ${codec}`
    });
}

function promiseifiedRead(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function previewSavedVideo(filename, response) {

    const running = killAllRunning();
    logger.info('VideoStream: Results of stopping all: ' + stringify(running));

    imageStreamProcess = undefined;
    libcameraProcess = undefined;
    directStreamProcess = undefined;

    const configFileName = `${filename}.cfg`.replace(/\/images\//, '/imageConfig/');

    const configData = await promiseifiedRead(configFileName);

    playbackStream = playFile(filename, configData);
    // 60 seconds kill the process
    setTimeout(() => {
        if (!playbackStream) {
            return;
        }
        try {
            if (playbackStream.stdin) {
                playbackStream.stdin.destroy();
            }
            if (playbackStream.stderr) {
                playbackStream.stderr.destroy();
            }
            playbackStream.kill('SIGKILL');
        } catch (e) {
            logger.info('Error stopping playback');
        }
    }, 60000);

    playbackStream.stdout.pipe(response);

    playbackStream.stderr.on('data', errorHandler);
    logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(configData)} pid: ${playbackStream.pid}`);

    captureEmitter.emit('button-exec', {
        method: 'previewSavedVideo',
        status: 'video preview should be playing'
    });
}

module.exports = {
    BASE_IMAGE_PATH,
    BASE_CONFIG_PATH,
    HISTOGRAM_CONFIG_PATH,
    SOLVED_INFO_PATH,
    getVideoFilename,
    saveVideoData,
    saveImagesData,
    directStream,
    imageStream,
    getVideoUpdateOptions,
    setVideoUpdateOptions,
    getImageUpdateOptions,
    setImageUpdateOptions,
    getLibcameraProcess,
    getDirectStreamProcesss,
    unsetDirectStreamProcesss,
    getImageStreamProcess,
    setImageStreamProcess,
    captureEmitter,
    previewSavedVideo
};
