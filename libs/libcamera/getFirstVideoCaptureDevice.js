const {
    readdir
} = require('fs'), {
    spawn
} = require('child_process');

const basedir = process.cwd();

const logger = require(`${basedir}/libs/logger`)(__filename);

// find all the video devices
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

// find video capture devices
function runVideo4Linux2Control(device) {
    return new Promise((resolve, reject) => {
        const v4l2ctl = spawn('v4l2-ctl', [`--device=/dev/${device}`, '--all']);
        const capture = spawn('grep', ['Video Capture']);
        const filtered = spawn('grep', ['-v', 'Format Video Capture']);

        const resultData = {
            hasdata: false,
            device,
            errorMsg: ''
        };

        v4l2ctl.stdout.pipe(capture.stdin);
        capture.stdout.pipe(filtered.stdin);
        filtered.stdout.on('data', d => {
            if (d && d.length > 0) {
                resultData.hasdata = true;
            }
        });

        v4l2ctl.stderr.on('data', d => {
            resultData.errorMsg = d;
            return reject(resultData);
        });
        capture.stderr.on('data', d => {
            resultData.errorMsg = d;
            return reject(resultData);
        });
        filtered.stderr.on('data', d => {
            resultData.errorMsg = d;
            return reject(resultData);
        });
        filtered.on('close', () => {
            return resolve(resultData);
        });
    });
}

// return the first capture device or nothing
async function getFirstVideoCaptureDevice() {

    const devices = await getVideoCaptureDevices();
    if (!devices || devices.length <= 0) {
        logger.error('No video devices found!');
        return [];
    }

    const promiseList = devices.map(device => {
        return runVideo4Linux2Control(device);
    });

    const resultDevices = await Promise.allSettled(promiseList);
    if (!resultDevices || resultDevices.length <= 0) {
        logger.error('No video capture devices found!');
        return [];
    }

    const filteredList = resultDevices.filter(item => {
        return item.status === 'fulfilled';
    });

    if (filteredList.length <= 0) {
        return [];
    }

    return filteredList.map(item => {
        return `/dev/${item.value.device}`;
    });
}

module.exports = getFirstVideoCaptureDevice;
