const { spawn } = require('child_process'),
    fs = require('fs');

global.libcameraProcess;
global.directStreamProcess;
global.imageStreamProcess;

const BASH_CMD = '/bin/bash';

const BASE_IMAGE_PATH = `${process.env.HOME}/images`,
    BASE_CONFIG_PATH = `${process.env.HOME}/imageConfig`;

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

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        {
            padNumber,
            getH264Bitrate
        } = require(`${resolveFileLocation}/libs/utils`),
        NullStream = require(`${resolveFileLocation}/libs/NullStream.js`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            getImageUpdateOptions,
            setImageUpdateOptions,
            streamJpeg,
            saveImage
        } = require(`${resolveFileLocation}/libs/libcamera/still`)(resolveFileLocation),
        {
            getVideoUpdateOptions,
            setVideoUpdateOptions,
            streamMjpeg,
            saveH264
        } = require(`${resolveFileLocation}/libs/libcamera/video`)(resolveFileLocation),
        {
            getFfmpegStream,
            previewStream
        } = require(`${resolveFileLocation}/libs/ffmpeg`);

    const MJPEG_IMAGE_CMD = `${resolveFileLocation}/scripts/imageStream.sh`;
    const SAVE_IMAGES_CMD = `${resolveFileLocation}/scripts/imageCapture.sh`;

    initSystem(logger);

    function killAllRunning() {

        const streams = [
            global.directStreamProcess,
            global.libcameraProcess,
            global.imageStreamProcess
        ].filter(stream => {
            return (stream && stream.pid);
        });
        const results = streams.map(stream => {
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
        const spawnOptions = options;
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
        const rawDataProcess = saveH264(spawnOptions);
        rawDataProcess.on('close', (code) => {
            response.writeHead(200, {});
            response.end(`Saved raw data with status code ${code} using options ${stringify(spawnOptions)}.`);
        });
        saveConfig(stringify(spawnOptions), 'h264');
    }

    function saveImagesData(options, response) {

        /*const running = killAllRunning();
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
        */
        const spawnOptions = options.concat();
        if (spawnOptions.length === 0) {
            const filtered = getImageUpdateOptions().join(' ');
            spawnOptions.push(filtered);
        }
        spawnOptions.unshift(SAVE_IMAGES_CMD);
        const filename = `${BASE_IMAGE_PATH}/${getVideoFilename('png')}`;
        spawnOptions.push(`-o ${filename}`);
        const rawDataProcess = spawn(BASH_CMD, spawnOptions, {
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

        const spawnOptions = (options.length > 0 ? options : getImageUpdateOptions());

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

        const spawnOptions = (options.length > 0 ? options : getVideoUpdateOptions());

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

    return {
        BASE_IMAGE_PATH,
        BASE_CONFIG_PATH,
        getVideoFilename,
        saveRawVideoData,
        saveImagesData,
        directStream,
        imageStream,
        previewProcess: previewStream,
        saveVideoProcess,
        getVideoUpdateOptions,
        setVideoUpdateOptions,
        getImageUpdateOptions,
        setImageUpdateOptions
    };
};
