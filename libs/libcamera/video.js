const {
        readdir
    } = require('fs'),
    {
        spawn
    } = require('child_process');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    getEnvVar = require(`${basedir}/libs/env`).getEnvVar,
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        VIDEO
    } = (getEnvVar('LEGACY_STACK') ?
        require(`${basedir}/libs/libcamera/RConstants`) :
        require(`${basedir}/libs/libcamera/Constants`)),
    config = (getEnvVar('LEGACY_STACK') ?
        require(`${basedir}/libs/libcamera/rvideoConfig`) :
        require(`${basedir}/libs/libcamera/videoConfig`));

const DEFAULT_OPTIONS = [];

let lastVideoUpdateOpts;

function getVideoUpdateOptions() {
    return lastVideoUpdateOpts;
}

function setVideoUpdateOptions(opts) {
    lastVideoUpdateOpts = opts;
}

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

function getVideoCaptureDevices() {
    return new Promise((resolve, reject) => {
        readdir('/dev', (err, data) => {
            if (err) {
                return reject(err);
            }
            const videoDevices = data.filter(device => {
                return device.startsWith('video');
            });
            return resolve(videoDevices);
        });
    });
}

function runVideo4Linux2Control(device) {
    return new Promise((resolve, reject) => {
        const v4l2ctl= spawn('v4l2-ctl', [`--device=/dev/${device}`, '--all']);
        const capture = spawn('grep', ['Video Capture']);
        const filtered = spawn('grep', ['-v', 'Format Video Capture']);

        let hasdata = false;

	    v4l2ctl.stdout.pipe(capture.stdin);
	    capture.stdout.pipe(filtered.stdin);
	    filtered.stdout.on('data', d => {
		    if (d && d.length > 0 ) {
                hasdata = true;
		    }
	    });

	    v4l2ctl.stderr.on('data', d => {
            return reject(d);
	    });
	    capture.stderr.on('data', d => {
            return reject(d);
	    });
	    filtered.stderr.on('data', d => {
            return reject(d);
	    });
        filtered.on('close', () => {
            return resolve(hasdata);
        });
    });
}

async function getFirstVideoCaptureDevice() {

    const devices = getVideoCaptureDevices();

    const promiseList = devices.map(device => {
        return runVideo4Linux2Control(device);
    });

    const resultDevices = await Promise.allSettled(promiseList);

    return resultDevices;
}

function streamMjpeg(options = []) {

    // default image streaming options
    const spawnOptions = ['--codec', 'mjpeg', '-t', '0'].concat(options);

    // stream to stdout
    spawnOptions.push('-o');
    spawnOptions.push('-');

    logger.info(`Libcamera video: ${VIDEO} options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

function saveH264(options = []) {

    const spawnOptions = ['--codec', 'h264', '-t', '60000'].concat(options);

    logger.info(`Libcamera video save h264 options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

function saveMjpeg(options = []) {

    const spawnOptions = ['--codec', 'mjpeg', '-t', '60000'].concat(options);

    logger.info(`Libcamera video save mjpeg options: ${stringify(spawnOptions)}`);

    return spawn(VIDEO, spawnOptions, {
        env: process.env
    });
}

module.exports = {
    getVideoUpdateOptions,
    setVideoUpdateOptions,
    streamMjpeg,
    saveH264,
    saveMjpeg
};
