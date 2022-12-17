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
        saveH264,
        saveYUV420,
        saveRAW,
        saveMjpeg,
        saveLibav,
        initVideo
    } = require(`${basedir}/libs/libcamera/video`),
    {
        initFfmpeg,
        getFfmpegStream,
        playFile,
        getFfmpegWebmStream
    } = require(`${basedir}/libs/ffmpeg`);

let libcameraProcess,
    directStreamProcess,
    imageStreamProcess,
    playbackStream;

const ffmpegStreamFunction = getEnvVar('STREAM_WEBM') ? getFfmpegWebmStream : getFfmpegStream;

const BASE_IMAGE_PATH = `${process.env.HOME}/images`,
    BASE_CONFIG_PATH = `${process.env.HOME}/imageConfig`;

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

function callSaveImage(options, count, total, callback) {

    const spawnOptions = options.concat();
    const basefilename = getVideoFilename('png');
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
            callSaveImage(options, nextCount, total, callback);
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

    const options = getImageUpdateOptions();
    const total = (request.query || {}).imagecount || 1;

    const spawnOptions = options.concat();

    // no preview for saving 
    if (request.query.preview && decodeURIComponent(request.query.preview) === '--nopreview') {
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
    }

    const count = 0;
    callSaveImage(options, count, total, callback)

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
    YUV420_CODEC = 'yuv420',
    H264_CODEC = 'h264',
    RAW_CODEC = 'raw',
    LIBAV_CODEC = 'libav';

function saveVideoData(codec, options = [], request, response, videoConfig) {

    const spawnOptions = options.concat();

    // no preview for saving 
    if (request.query.preview && decodeURIComponent(request.query.preview) === '--nopreview') {
        spawnOptions.push('--nopreview');
    }

    let extension = MJPEG_CODEC,
        videoRecordingMethod = saveMjpeg;
    switch (codec) {
    case RAW_CODEC:
        extension = RAW_CODEC;
        videoRecordingMethod = saveRAW;
        break;
    case H264_CODEC:
        extension = H264_CODEC;
        videoRecordingMethod = saveH264;

        const optionsStr = options.join(' ');
        const bitRate = getH264Bitrate(videoConfig, optionsStr);
        if (bitRate && bitRate.length > 0) {
            bitRate.split(' ').forEach(x => {
                spawnOptions.push(x);
            });
        }
        break;
    case YUV420_CODEC:
        extension = YUV420_CODEC;
        videoRecordingMethod = saveYUV420;
        break;
    case LIBAV_CODEC:
        const codecOptions = decodeURIComponent(request.query.codec).split(' ');
        const codecType = codecOptions[2];
        switch (codecType) {
            case 'libopenjpeg':
                extension = MJPEG_CODEC;
                break;
            case 'ljpeg':
                extension = MJPEG_CODEC;
                break;
            case 'tiff':
                extension = MJPEG_CODEC;
                break;
            default:
                extension = MJPEG_CODEC;
                break;
        }
        codecOptions.forEach(opt => {
            if (opt !== LIBAV_CODEC) {
                spawnOptions.push(opt);
            }
        });
        videoRecordingMethod = saveLibav;
        break;
    default:
        extension = MJPEG_CODEC;
        videoRecordingMethod = saveMjpeg;
        break;
    }

    const basefilename = getVideoFilename(extension);
    const filename = `${BASE_IMAGE_PATH}/${basefilename}`;

    spawnOptions.push('-o');
    spawnOptions.push(filename);

    const recordingTime = request.query.recordingTime || 60000;
    const recordTimeIndex = spawnOptions.indexOf('t');
    if (recordTimeIndex > -1) {
        spawnOptions[recordTimeIndex + 1] = recordingTime;
    } else {
        spawnOptions.push('-t');
        spawnOptions.push(recordingTime);
    }

    const running = killAllRunning();
    logger.info('Results of stopping all: ' + stringify(running));

    libcameraProcess = undefined;
    directStreamProcess = undefined;
    imageStreamProcess = undefined;

    const saveDataProcess = videoRecordingMethod(spawnOptions);
    const logData = [];
    if (codec === RAW_CODEC) {
        saveDataProcess.stderr.on('data', data => {
            logger.info(data.toString());
            logData.push(data.toString());
        });
    }
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
