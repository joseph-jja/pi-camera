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

function getH264Bitrate(videoConfig, paramString) {

    const videoSize = videoConfig.filter(item => {
        return (item.name === 'videoSize');
    })[0];

    const videoSizeValue = videoSize.values.filter(item => {
        return (paramString.indexOf(item) > -1);
    });

    if (videoSizeValue && videoSizeValue.length > 0) {
        const videoOption = videoSizeValue[0].split(' ');
        const [width, height] = videoOption.filter(item => {
            return parseInt(item);
        });
        const wxh = width * height;
        let bitrate = 18000000;
        if (wxh === 307200 || wxh === 480000) {
            // 640 x 480
            bitrate = 18000000;
        } else if (wxh === 921600) {
            // 1280 x 720
            bitrate = 35000000;
        } else if (wxh === 2073600) {
            // 1920 x 1080
            bitrate = 85000000;
        } else {
            // everything else
            bitrate = 18000000;
        }
        return `--bitrate ${bitrate}`;
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
