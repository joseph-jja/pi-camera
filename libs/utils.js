const dns  = require('dns').promises,
    childProcess = require('child_process'),
    { readdir } = require('fs');

function padNumber(num) {
    return new String(num).padStart(2, 0);
}

async function getIPAddress(hostname) {

    let ipaddr;
    try {
        ipaddr = (await dns.resolve4(hostname))[0];
    } catch(e) {
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
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };
    const [err, files] = await promiseWrapper(promisifedReaddir(imageDir));
    if (err) {
        console.error(err);
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

module.exports = {
    padNumber,
    getIPAddress,
    getHostname,
    promiseWrapper,
    listImageFiles
};
