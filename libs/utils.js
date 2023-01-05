const { loggers } = require('winston');

const dns = require('dns').promises,
    statSync = require('fs').statSync,
    childProcess = require('child_process'),
    {
        readdir
    } = require('fs');

function padNumber(num) {
    return new String(num).padStart(2, 0);
}

function exists(file) {
    try {
        const exists = statSync(file);
        return exists;
    } catch (e) {
        return false;
    }
}
async function getIPAddress(hostname) {

    let ipaddr;
    try {
        ipaddr = (await dns.resolve4(hostname))[0];
    } catch (e) {
        ipaddr = childProcess.execSync('ifconfig |grep inet|grep -v inet6 |grep broadcast | awk \'{print $2}\'');
    }
    return `${ipaddr}`.trim();
}

async function getHostname() {

    return new Promise((resolve, reject) => {
        childProcess.exec('hostname', (err, sout, serr) => {
            if (err) {
                reject(err);
            } else if (serr) {
                reject(serr);
            } else {
                resolve(sout);
            }
        });
    });
}

const promiseWrapper = promiseIn => (
    promiseIn.then(data => ([undefined, data])).catch(msg => ([msg, undefined]))
);

async function listImageFiles(imageDir) {

    const promisifedReaddir = (indir) => {
        return new Promise((resolve, reject) => {
            readdir(indir, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    const [err, files] = await promiseWrapper(promisifedReaddir(imageDir));
    if (err) {
        return {
            hasError: true,
            message: err
        };
    }
    return {
        hasError: false,
        message: files
    };
}

const GOP_SIZE = 12; // BPP ?
function getH264Bitrate(videoConfig, paramString) {

    const videoSize = videoConfig.filter(item => {
        return (item.name === 'videoSize');
    });

    if (!videoSize || videoSize.length < 1) {
        return '';
    }

    const videoSizeValue = videoSize[0].values.filter(item => {
        return (paramString.indexOf(item) > -1);
    });

    const videoFramerate = videoConfig.filter(item => {
        return (item.name === 'framerate');
    });

    let videoFramerateValue = 0;
    if (videoFramerate && videoFramerate.length > 0) {
        const videoFramerateArray = videoFramerate[0].values.filter(item => {
            return (paramString.indexOf(item) > -1);
        });
        if (videoFramerateArray && videoFramerateArray.length > 0) {
            videoFramerateValue = videoFramerateArray[0];
        }
    }

    if (videoSizeValue && videoSizeValue.length > 0) {
        const videoOption = videoSizeValue[0].split(' ');
        const [width, height] = videoOption.filter(item => {
            return parseInt(item);
        });
        const wxh = width * height;
        let bitrateMaxNeeded = 0;
        if (videoFramerateValue > 0) {
            const fpsGOP = videoFramerateValue / GOP_SIZE;
            const pixelsPerFPS = videoFramerateValue * wxh;
            bitrateMaxNeeded = Math.ceil(pixelsPerFPS / fpsGOP);
            loggers.info(`Bitrate max needed: ${bitrateMaxNeeded}`);
        }

        // 62208000

        let bitrate = 18000000;
        if (wxh >= 2190240) {
             // 2028 x 1080 or larger
             bitrate = 95000000;
        } else if (wxh >= 2073600) {
            // 1920 x 1080 or larger 
            // but less than 2028 x 1080
            bitrate = 85000000;
        } else if (wxh >= 1318680) {
            // 1332 x 990
            // but less than 1920 x 1080
            bitrate = 80000000;
        } else if (wxh >= 921600) {
            // 1280 x 720
            // but less than 1332 x 990
            bitrate = 50000000;
        } else if (wxh >= 480000) {
            // 800 x 600
            // but less than 1280 x 720
            bitrate = 30000000;
        } else if (wxh >= 307200) {
            // 640 x 480
            // but less than 800 x 600
            bitrate = 18000000;
        } else {
            // everything else
            bitrate = 18000000;
        }
        if (bitrateMaxNeeded > 0 && bitrate < bitrateMaxNeeded) {
            loggers.info(`Using slower bitrate than needed ${bitrate} vs ${bitrateMaxNeeded}`);
        }
        return `--bitrate ${bitrate} --profile high`;
    }
    return '';
}

const filterRequestBody = (body) => {
    return Object.keys(body).filter(item => {
        return (item && item.length > 0);
    });
};

const getOptions = (body) => {
    const options = filterRequestBody(body);
    if (options.length > 0) {
        return options.map(item => {
            return item.split(' ');
        }).reduce((acc, next) => acc.concat(next));
    }
    return options;
};

async function sleep(sleepTime) {
    setTimeout(() => {
        Promise.resolve();
    }, sleepTime);
}

module.exports = {
    sleep,
    padNumber,
    getIPAddress,
    getHostname,
    promiseWrapper,
    listImageFiles,
    getH264Bitrate,
    getOptions,
    exists
};
