const childProcess = require('child_process'),
    fs = require('fs');

module.exports = function(resolveFileLocation) {

    const { padNumber } = require(`${resolveFileLocation}/libs/utils`);
    const stringify = require(`${resolveFileLocation}/libs/stringify`);
    const NullStream = require(`${resolveFileLocation}/libs/NullStream.js`);

    const BASH_CMD = '/bin/bash';

    const DEFAULT_OPTIONS = '--width 1640 --height 1232 --metering centre --framerate 15 --exposure normal'.split(' ');

    const VIDEO_CMD = `${resolveFileLocation}/scripts/streamServer.sh`;
    const MJPEG_DIRECT_CMD = `${resolveFileLocation}/scripts/directStream.sh`;
    const SAVE_CMD = `${resolveFileLocation}/scripts/saveStream.sh`;
    const SAVE_RAW_CMD = `${resolveFileLocation}/scripts/saveRawStream.sh`;

    function getVideoFilename() {
        const now = new Date();
        const datePart = `${now.getFullYear()}${padNumber(now.getMonth()+1)}${padNumber(now.getDate())}`;
        const timePart = `${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}`;
        return `capture-${datePart}${timePart}.mjpeg`;
    }

    global.videoProcess;
    global.directStreamProcess;

    function spawnVideoProcess(options) {

        const spawnOptions = options.concat();
        spawnOptions.unshift(VIDEO_CMD);
        global.videoProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        global.videoProcess.stdout.on('data', (data) => {
            console.log(`${VIDEO_CMD}: ${data}`);
        });
    }

    function saveRawVideoData(options, response) {

        const spawnOptions = options.concat();
        spawnOptions.unshift(SAVE_RAW_CMD);
        const rawDataProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        rawDataProcess.on('close', () => {
            response.writeHead(200, {});
            response.end('Saved raw data');
        });
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
            console.log('Video stream has ended!');
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
        console.log(`Should be streaming now from ${rptsHost} with options: ${stringify(spawnOptions)}...`);
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
        global.directStreamProcess.on('close', () => {
            response.writeHead(200, {});
            response.end('Finished writing file to disk');
        });
        setTimeout(() => {
            global.directStreamProcess.stdout.off('data', callback);
            console.log(`Finished writing file ${filename}`);
        }, 60000);
    }

    return {
        BASH_CMD,
        DEFAULT_OPTIONS,
        VIDEO_CMD,
        SAVE_CMD,
        getVideoFilename,
        spawnVideoProcess,
        saveRawVideoData,
        directStream,
        saveVideoProcess
    };

};
