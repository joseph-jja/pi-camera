const childProcess = require('child_process'),
    fs = require('fs');

global.videoProcess;
global.directStreamProcess;

const BASH_CMD = '/bin/bash';

const DEFAULT_OPTIONS = [];

module.exports = function(resolveFileLocation) {

    const config = require(`${resolveFileLocation}/videoConfig`);

    const { padNumber } = require(`${resolveFileLocation}/libs/utils`);
    const stringify = require(`${resolveFileLocation}/libs/stringify`);
    const NullStream = require(`${resolveFileLocation}/libs/NullStream.js`);
    const logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    const VIDEO_CMD = `${resolveFileLocation}/scripts/streamServer.sh`;
    const MJPEG_DIRECT_CMD = `${resolveFileLocation}/scripts/directStream.sh`;
    const SAVE_CMD = `${resolveFileLocation}/scripts/saveStream.sh`;
    const SAVE_RAW_CMD = `${resolveFileLocation}/scripts/saveRawStream.sh`;
    const SAVE_IMAGES_CMD = `${resolveFileLocation}/scripts/imageCapture.sh`;
    const PREVIEW_PROCESS = `${resolveFileLocation}/scripts/previewStream.sh`;

    config.forEach(item => {
        if (item.defaultvalue) {
            item.defaultvalue.split(' ').forEach(item => {
                DEFAULT_OPTIONS.push(item);
            });
        }
    });

    function getVideoFilename() {
        const now = new Date();
        const datePart = `${now.getFullYear()}${padNumber(now.getMonth()+1)}${padNumber(now.getDate())}`;
        const timePart = `${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}`;
        return `capture-${datePart}${timePart}.mjpeg`;
    }

    let keep = true;
    function filterOptions(item) {
        if ( item === '--profile' || item === '--bitrate' ||
            item === '--quality' ) {
            keep = false;
            return false;
        } else if (!keep) {
            keep = true;
            return false;
        }
        return true;
    }

    function spawnVideoProcess(options) {

        const spawnOptions = options.concat();
        spawnOptions.unshift(VIDEO_CMD);
        global.videoProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        global.videoProcess.stdout.on('data', (data) => {
            logger.info(`${VIDEO_CMD}: ${data}`);
        });
    }

    function saveRawVideoData(options, response) {

        const spawnOptions = [options.filter(filterOptions).join(' ')];
        spawnOptions.unshift(SAVE_RAW_CMD);
        const filename = `${process.env.HOME}/images/${getVideoFilename().replace('mjpeg', 'raw')}`;
        spawnOptions.push(`-o ${filename}`);
        const rawDataProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        rawDataProcess.on('close', (code) => {
            response.writeHead(200, {});
            response.end(`Saved raw data with status code ${code}.`);
        });
    }

    let replaceFlag = false;
    function replaceOption(item) {
        if (item === '--framerate') {
            replaceFlag = true;
            return '---shutter';
        } else if (replaceFlag) {
            replaceFlag = false;
            return (1 / item); // convert framerate to how long we want to capture the image
        }
        return item;
    }

    function saveImagesData(options, response) {

        const spawnOptions = options.map(replaceOption).concat();
        spawnOptions.unshift(SAVE_IMAGES_CMD);
        const filename = `${process.env.HOME}/images/${getVideoFilename().replace('mjpeg', 'png')}`;
        spawnOptions.push(`-o ${filename}`);
        const rawDataProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        rawDataProcess.on('close', (code) => {
            response.writeHead(200, {});
            response.end(`Saved raw data with status code ${code}.`);
        });
    }

    function directStream(options) {

        const spawnOptions = [options.filter(filterOptions).join(' ')];
        if (spawnOptions.length === 0) {
            const filtered =  DEFAULT_OPTIONS.filter(filterOptions).join(' ');
            spawnOptions.push(filtered);
        }
        spawnOptions.unshift(MJPEG_DIRECT_CMD);
        global.directStreamProcess = childProcess.spawn(BASH_CMD, spawnOptions);
        const listeners = global.directStreamProcess.stdout.listeners('data');
        for (let i =0, end = listeners.length; i < end; i++) {
            global.directStreamProcess.stdout.removeListener('data', listeners[i]);
        }
        const DevNull = new NullStream();
        global.directStreamProcess.stdout.pipe(DevNull);
        global.directStreamProcess.stderr.on('error', (err) => {
            console.error('Error', err);
        });
        global.directStreamProcess.on('close', () => {
            logger.info('Video stream has ended!');
            DevNull.destroy();
        });
        let isRtpsHost = false;
        const rptsHost = spawnOptions.filter(item => {
            if (item === '--rtspHost') {
                isRtpsHost = true;
                return false;
            }
            return isRtpsHost;
        });
        logger.info(`Should be streaming now from ${rptsHost} with options: ${stringify(spawnOptions)}...`);
    }

    function saveVideoProcess(options, response) {

        if (!global.directStreamProcess) {
            directStream(options);
        }
        try {
            fs.mkdirSync(`${process.env.HOME}/images`);
        } catch(e) {
            console.error(e);
        }
        const filename = `${process.env.HOME}/images/${getVideoFilename()}`;
        const fileout = fs.createWriteStream(filename);
        const callback = (d) => {
            fileout.write(d);
        };
        global.directStreamProcess.stdout.on('data', callback);
        setTimeout(() => {
            global.directStreamProcess.stdout.off('data', callback);
            logger.info(`Finished writing file ${filename}`);
            response.writeHead(200, {});
            response.end('Finished writing file to disk');
        }, 60000);
    }

    function previewProcess() {
        return childProcess.spawn(BASH_CMD, [PREVIEW_PROCESS]);
    }

    return {
        DEFAULT_OPTIONS,
        BASH_CMD,
        VIDEO_CMD,
        SAVE_CMD,
        getVideoFilename,
        spawnVideoProcess,
        saveRawVideoData,
        saveImagesData,
        directStream,
        previewProcess,
        saveVideoProcess
    };
};
