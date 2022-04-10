const childProcess = require('child_process'),
    fs = require('fs');

global.libcameraProcess;
global.directStreamProcess;
global.imageStreamProcess;

const BASH_CMD = '/bin/bash';

const BASE_IMAGE_PATH = `${process.env.HOME}/images`,
    BASE_CONFIG_PATH = `${process.env.HOME}/imageConfig`;

const DEFAULT_OPTIONS = [],
    DEFAULT_IMAGE_CONFIG = [];

let lastUpdateOpts,
    lastImageUpdateOpts;

function getVideoUpdateOptions() {
    return lastUpdateOpts;
}

function setVideoUpdateOptions(opts) {
    lastUpdateOpts = opts;
}

function getImageUpdateOptions() {
    return lastImageUpdateOpts;
}

function setImageUpdateOptions(opts) {
    lastImageUpdateOpts = opts;
}

function updateConfigs(resolveFileLocation) {
    //only once
    const config = require(`${resolveFileLocation}/libs/libcamera/videoConfig`);
    if (DEFAULT_OPTIONS.length === 0) {
        config.forEach(item => {
            if (item.defaultvalue) {
                item.defaultvalue.split(' ').forEach(item => {
                    DEFAULT_OPTIONS.push(item);
                });
            }
        });
        setVideoUpdateOptions(DEFAULT_OPTIONS);
    }

    const imageConfig = require(`${resolveFileLocation}/libs/libcamera/stillConfig`);
    if (DEFAULT_IMAGE_CONFIG.length === 0) {
        imageConfig.forEach(item => {
            if (item.defaultvalue) {
                item.defaultvalue.split(' ').forEach(item => {
                    DEFAULT_IMAGE_CONFIG.push(item);
                });
            }
        });
        setImageUpdateOptions(DEFAULT_IMAGE_CONFIG);
    }
}

function initSystem(logger) {
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

function getAllRunning() {
    const results = [];
    if (global.libcameraProcess) {
        results.push(global.libcameraProcess.pid);
    }
    if (global.directStreamProcess) {
        results.push(global.directStreamProcess.pid);
    }
    if (global.imageStreamProcess) {
        results.push(global.imageStreamProcess.pid);
    }
    return results.join(' ');
}


module.exports = function(resolveFileLocation) {

    updateConfigs(resolveFileLocation);

    const {
        padNumber,
        getH264Bitrate
    } = require(`${resolveFileLocation}/libs/utils`);
    const stringify = require(`${resolveFileLocation}/libs/stringify`);
    const NullStream = require(`${resolveFileLocation}/libs/NullStream.js`);
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);
    const {
        streamJpeg,
        saveImage
    } = require(`${resolveFileLocation}/libs/libcamera/still`)(resolveFileLocation);
    const {
        streamMjpeg,
        saveH264
    } = require(`${resolveFileLocation}/libs/libcamera/video`)(resolveFileLocation);
    const {
        getFfmpegStream,
        previewStream
    } = require(`${resolveFileLocation}/libs/ffmpeg`);

    const MJPEG_IMAGE_CMD = `${resolveFileLocation}/scripts/imageStream.sh`;
    const SAVE_IMAGES_CMD = `${resolveFileLocation}/scripts/imageCapture.sh`;

    initSystem(logger);

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
        const spawnOptions = options;
        if (bitRate && bitRate.length > 0) {
            bitRate.split(' ').forEach(x => {
                spawnOptions.push(x);
            });
        }
        const filename = `${BASE_IMAGE_PATH}/${getVideoFilename('h264')}`;
        spawnOptions.push('-o');
        spawnOptions.push(filename);
        const running = getAllRunning();
        const spawnFn = () => {
            const rawDataProcess = saveH264(spawnOptions);
            rawDataProcess.on('close', (code) => {
                response.writeHead(200, {});
                response.end(`Saved raw data with status code ${code} using options ${stringify(spawnOptions)}.`);
            });
            saveConfig(stringify(spawnOptions), 'h264');
        };
        if (running.length > 0) {
            childProcess.exec(`kill -9 ${running}`, (err, success) => {
                spawnFn();
            });
        } else {
            spawnFn();
        }
    }

    function saveImagesData(options, response) {

        const running = getAllRunning();
        const spawnFn = () => {
            const spawnOptions = options.concat();
            const filename = `${BASE_IMAGE_PATH}/${getVideoFilename('png')}`;
            spawnOptions.push('-o');
            spawnOptions.push(filename);
            const rawDataProcess = saveImage(spawnOptions);
            rawDataProcess.on('close', (code) => {
                response.writeHead(200, {});
                response.end(`Saved image data with status code ${code} using options ${stringify(spawnOptions)}.`);
            });
            logger.info(`${SAVE_IMAGES_CMD}: ${stringify(spawnOptions)}`);
            saveConfig(stringify(spawnOptions), 'png');
        };
        /*if (running.length > 0) {
            childProcess.exec(`kill -9 ${running}`, (err, success) => {
                spawnFn();
            });
        } else {
            spawnFn();
        }*/
        const spawnOptions = options.concat();
        if (spawnOptions.length === 0) {
            const filtered = DEFAULT_IMAGE_CONFIG.join(' ');
            spawnOptions.push(filtered);
        }
        spawnOptions.unshift(SAVE_IMAGES_CMD);
        const filename = `${BASE_IMAGE_PATH}/${getVideoFilename('png')}`;
        spawnOptions.push(`-o ${filename}`);
        const rawDataProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        rawDataProcess.on('close', (code) => {
            response.writeHead(200, {});
            response.end(`Saved image data with status code ${code} using options ${stringify(spawnOptions)}.`);
        });
        logger.info(`${SAVE_IMAGES_CMD}: ${stringify(spawnOptions)}`);
        saveConfig(stringify(spawnOptions), 'png');
    }

    function imageStream(options) {

        /*const running = getAllRunning();
        const spawnFn = () => {
            global.imageStreamProcess = streamMjpeg(options);
            const listeners = global.imageStreamProcess.stdout.listeners('data');
            for (let i = 0, end = listeners.length; i < end; i++) {
                global.imageStreamProcess.stdout.removeListener('data', listeners[i]);
            }
            const DevNull = new NullStream();
            global.imageStreamProcess.stdout.pipe(DevNull);
            global.imageStreamProcess.stderr.on('error', (err) => {
                console.error('Error', err);
            });
            global.imageStreamProcess.on('close', () => {
                logger.info('Video stream has ended!');
                DevNull.destroy();
            });
            logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)}...`);
        };*/
        /*if (running.length > 0) {
            childProcess.exec(`kill -9 ${running}`, (err, success) => {
                spawnFn();
            });
        } else {
            spawnFn();
        }*/
        const spawnOptions = [options.join(' ')];
        if (spawnOptions.length === 0) {
            const filtered = DEFAULT_IMAGE_CONFIG.join(' ');
            spawnOptions.push(filtered);
        }
        spawnOptions.unshift(MJPEG_IMAGE_CMD);
        global.imageStreamProcess = childProcess.spawn(BASH_CMD, spawnOptions);
        const listeners = global.imageStreamProcess.stdout.listeners('data');
        for (let i = 0, end = listeners.length; i < end; i++) {
            global.imageStreamProcess.stdout.removeListener('data', listeners[i]);
        }
        const DevNull = new NullStream();
        global.imageStreamProcess.stdout.pipe(DevNull);
        global.imageStreamProcess.stderr.on('error', (err) => {
            console.error('Error', err);
        });
        global.imageStreamProcess.on('close', () => {
            logger.info('Video stream has ended!');
            DevNull.destroy();
        });
        logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)}...`);
    }

    function directStream(options = []) {

        const spawnOptions = (options.length > 0 ? options : DEFAULT_OPTIONS);

        const running = getAllRunning();
        const spawnFn = () => {
            // stream libcamera stdout to ffmpeg stdin
            //global.libcameraProcess = streamMjpeg(spawnOptions);
            fs.writeFileSync('/tmp/videoStream.sh', streamMjpeg(spawnOptions));
            global.libcameraProcess = childProcess.spawn(BASH_CMD, ['/tmp/videoStream.sh']);
            global.directStreamProcess = getFfmpegStream();
            global.libcameraProcess.stdout.pipe(global.directStreamProcess.stdin);

            const listeners = global.directStreamProcess.stdout.listeners('data');
            for (let i = 0, end = listeners.length; i < end; i++) {
                global.directStreamProcess.stdout.removeListener('data', listeners[i]);
            }
            const DevNull = new NullStream();
            global.directStreamProcess.stdout.pipe(DevNull);
            global.directStreamProcess.stderr.on('error', (err) => {
                console.error('Error', err);
            });
            global.directStreamProcess.on('close', () => {
                global.libcameraProcess.stdout.unpipe(global.directStreamProcess.stdin);
                logger.info('Video stream has ended!');
                DevNull.destroy();
            });
            logger.info(`Should be streaming now from ${process.env.IP_ADDR} with options: ${stringify(spawnOptions)}...`);
        };
        if (running.length > 0) {
            childProcess.exec(`kill -9 ${running}`, (err, success) => {
                spawnFn();
            });
        } else {
            spawnFn();
        }
    }

    function saveVideoProcess(options, response) {

        if (!global.directStreamProcess) {
            directStream(options);
        }

        const filename = `${BASE_IMAGE_PATH}/${getVideoFilename()}`;
        const fileout = fs.createWriteStream(filename);
        const callback = (d) => {
            fileout.write(d);
        };
        saveConfig(stringify(options));
        global.directStreamProcess.stdout.on('data', callback);
        setTimeout(() => {
            global.directStreamProcess.stdout.off('data', callback);
            logger.info(`Finished writing file ${filename}`);
            response.writeHead(200, {});
            response.end(`Finished writing file to disk using options ${stringify(options)}`);
        }, 60000);
    }

    function previewProcess() {
        return previewStream();
    }

    return {
        BASE_IMAGE_PATH,
        BASE_CONFIG_PATH,
        getVideoFilename,
        saveRawVideoData,
        saveImagesData,
        directStream,
        imageStream,
        previewProcess,
        saveVideoProcess,
        getVideoUpdateOptions,
        setVideoUpdateOptions,
        getImageUpdateOptions,
        setImageUpdateOptions
    };
};
