
const BASH_CMD = '/bin/bash';

const DEFAULT_OPTIONS = ['--width 640 --height 480 --profile high --framerate 8 --quality 100'];

const getVideoCommand = (scriptDir) => {
    return `${scriptDir}/scripts/streamServer.sh`;
};

/*
const MJPEG_CMD = `${RESOLVED_FILE_LOCATION}/scripts/mjpegRestream.sh`;
const SAVE_CMD = `${RESOLVED_FILE_LOCATION}/scripts/saveStream.sh`;
const COMBINED_CMD = `${RESOLVED_FILE_LOCATION}/scripts/combined.sh`;

const FFMPEG_RUNNING_CMD = `${RESOLVED_FILE_LOCATION}/scripts/killPreview.sh`;
const FFMPEG_RTSP_COPY_CMD = `${RESOLVED_FILE_LOCATION}/scripts/rtspCopyStream.sh`;

function spawnVideoProcess(options) {

    const spawnOptions = options.concat();
    spawnOptions.unshift('--codec h264');
    spawnOptions.unshift(VIDEO_CMD);
    videoProcess = childProcess.spawn(BASH_CMD, spawnOptions, {
        env: process.env
    });
    videoProcess.stdout.on('data', (data) => {
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
    streamProcess = childProcess.spawn(BASH_CMD, spawnOptions);
    response.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
        'Cache-Control': 'no-cache'
    });
    streamProcess.stdout.pipe(response);
    streamProcess.on('close', () => {
        console.log('Video stream has ended!');
    });
    console.log('Should be streaming now ...');
}

function saveVideoProcess(options, response) {

    const now = new Date();
    const datePart = `${now.getFullYear()}${padNumber(now.getMonth()+1)}${padNumber(now.getDate())}`;
    const timePart = `${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}`;
    const filename = `capture-${datePart}${timePart}.mjpeg`;

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
*/
module.exports = {
    BASH_CMD,
    DEFAULT_OPTIONS,
    getVideoCommand/*,
    sendVideoProcess,
    saveVideoProcess,
    spawnVideoProcess*/
};
