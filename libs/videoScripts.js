const childProcess = require('child_process');

module.exports = function(resolveFileLocation) {

    const { padNumber } = require(`${resolveFileLocation}/libs/utils`),
        { getEnvVar } = require(`${resolveFileLocation}/libs/env`);

    const ENABLE_RTSP = getEnvVar(process.env.ENABLE_RTSP, true);

    const BASH_CMD = '/bin/bash';

    const DEFAULT_OPTIONS = '--width 640 --height 480 --profile high --framerate 8 --quality 100'.split(' ');

    const VIDEO_CMD = `${resolveFileLocation}/scripts/streamServer.sh`;
    const MJPEG_CMD = `${resolveFileLocation}/scripts/mjpegRestream.sh`;
    const SAVE_CMD = `${resolveFileLocation}/scripts/saveStream.sh`;
    const COMBINED_CMD = `${resolveFileLocation}/scripts/combined.sh`;
    const FFMPEG_RUNNING_CMD = `${resolveFileLocation}/scripts/killPreview.sh`;
    const FFMPEG_RTSP_COPY_CMD = `${resolveFileLocation}/scripts/rtspCopyStream.sh`;

    function getVideoFilename() {
        const now = new Date();
        const datePart = `${now.getFullYear()}${padNumber(now.getMonth()+1)}${padNumber(now.getDate())}`;
        const timePart = `${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}`;
        return `capture-${datePart}${timePart}.mjpeg`;
    }

    global.videoProcess;
    global.streamProcess;

    function spawnVideoProcess(options) {

        const spawnOptions = options.concat();
        spawnOptions.unshift('--codec h264');
        spawnOptions.unshift(VIDEO_CMD);
        global.videoProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
            env: process.env
        });
        global.videoProcess.stdout.on('data', (data) => {
            console.log(`${VIDEO_CMD}: ${data}`);
        });
    }

    function sendVideoProcess(options, response) {

        const spawnOptions = options.concat();
        if (spawnOptions.length === 0) {
            spawnOptions.push(DEFAULT_OPTIONS);
        }
        if (ENABLE_RTSP) {
            spawnOptions.unshift(MJPEG_CMD);
        } else {
            spawnOptions.unshift(COMBINED_CMD);
        }
        global.streamProcess = childProcess.spawn(BASH_CMD, spawnOptions);
        response.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
        });
        global.streamProcess.stdout.pipe(response);
        global.streamProcess.on('error', (err) =>{
            console.error('Error', err);
        });
        global.streamProcess.on('close', () => {
            console.log('Video stream has ended!');
        });
        console.log('Should be streaming now ...');
    }

    function saveVideoProcess(options, response) {

        const filename = getVideoFilename();

        const spawnOptions = options.concat();
        spawnOptions.push('--filename');
        spawnOptions.push(`${process.env.HOME}/images/${filename}`);
        spawnOptions.push(`--timeout ${options.timeout ? options.timeout : 15}`);
        if (spawnOptions.length === 0) {
            spawnOptions.push(DEFAULT_OPTIONS);
        }
        spawnOptions.unshift(SAVE_CMD);
        const saveStream = childProcess.spawn(BASH_CMD, spawnOptions);
        saveStream.stdout.on('data', data => {
            console.log(data.toString());
        });
        saveStream.on('close', () => {
            response.writeHead(200, {});
            response.end(`<a href="/download?filename=${filename}">${filename}</a>`);
        });
    }

    return {
        BASH_CMD,
        DEFAULT_OPTIONS,
        VIDEO_CMD,
        MJPEG_CMD,
        SAVE_CMD,
        COMBINED_CMD,
        FFMPEG_RUNNING_CMD,
        FFMPEG_RTSP_COPY_CMD,
        getVideoFilename,
        spawnVideoProcess,
        sendVideoProcess,
        saveVideoProcess
    };

};
