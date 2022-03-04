const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    dns  = require('dns').promises,
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

function getEnvValue(envName, defaultValue) {
    try {
        return JSON.parse(envName);
    } catch(e) {
        return defaultValue;
    }
}
const app = express();

const ENABLE_RTSP = getEnvValue(process.env.ENABLE_RTSP, false);

let videoProcess,
    streamProcess;

const BASH_CMD = '/bin/bash';
const VIDEO_CMD = `${process.env.HOME}/pi-camera/scripts/streamServer.sh`;
const MJPEG_CMD = `${process.env.HOME}/pi-camera/scripts/mjpegRestream.sh`;
const SAVE_CMD = `${process.env.HOME}/pi-camera/scripts/saveStream.sh`;
const COMBINED_CMD = `${process.env.HOME}/pi-camera/scripts/combined.sh`;

const DEFAULT_OPTIONS = ['--width 640 --height 480 --framerate 10'];

function getHTML(body) {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        <iframe id="videoDisplay" width="640" height="480" src="/preview"></iframe>

        <form name="cameraOptions" onsubmit="return false;">
            ${body}
            <br>
            <button type="submit" id="executeButton">
                Update
            </button>
            <br>
            <button type="submit" id="saveStream">
                Capture Stream
            </button>
        </form>
        <br><hr><br>
        <form name="shutdown" onsubmit="return false;">
            <button type="submit" id="shutdownButton">
                Shutdown
            </button>
        </form>
    </body>
    <script src="/js/captureClient.js" type="text/javascript"></script>
</html>`;
}

app.use(bodyParser.urlencoded({
    extended: false,
    limit: 100000
}));

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
}

function padNumber(num) {
    return new String(num).padStart(2, 0);
}

function saveVideoProcess(options, response) {

    const now = new Date();
    const datePart = `${now.getFullYear()}${padNumber(now.getMonth()+1)}${padNumber(now.getDate())}`;
    const timePart = `${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}`;
    const filename = `capture-${datePart}${timePart}.mjpeg`;

    const spawnOptions = options.concat();
    spawnOptions.push(`--filename ${filename}`);
    spawnOptions.push('--timeout 15')
    if (spawnOptions.length === 0) {
        spawnOptions.push(DEFAULT_OPTIONS);
    }
    spawnOptions.unshift(SAVE_CMD);
    const saveStream = childProcess.spawn(BASH_CMD, spawnOptions);
    saveStream.on('close', () => {
        response.writeHead(200, {});
        response.end(`<a href="/download?filename=${filename}">${filename}</a>`);
    });
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
async function start() {

    const baseDir = process.cwd();
    const config = require(`${baseDir}/cameraConfig`);

    const formFields = await import('./libs/form.mjs');

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);
    process.env.IP_ADDR = ipaddr;

    const fields = config.map(item => {

        if (item.values) {
            return formFields.buildSelect(item);
        } else if (item.range) {
            const values = formFields.getRangeValues(item);
            const ritem = Object.assign({}, item, {values});
            return formFields.buildSelect(ritem);
        } else if (item.fieldValue) {
            return formFields.textField(item);
        } else {
            console.log(item);
            return '';
        }
    }).reduce((acc, next) => {
        return `${acc}<br><br>${os.EOL}${next}`;
    });

    app.get('/js/captureClient.js', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        fs.createReadStream('js/captureClient.js').pipe(response);
    });

    app.post('/shutdown', (request, response) => {
        response.writeHead(200, {});
        response.end('');
        childProcess.spawn('sudo', ['shutdown', '-P', 'now']);
    });

    app.post('/update', (request, response) => {
        response.writeHead(200, {});
        response.end('');
        if (!ENABLE_RTSP) {
            return;
        }
        if (request.body && Object.keys(request.body).length > 0) {
            const options = Object.keys(request.body).filter(item => {
                return (item && item.length > 0);
            });
            if (options.length > 0) {
                if (videoProcess) {
                    const pid = videoProcess.pid;
                    childProcess.exec(`kill -9 ${pid}`, () => {
                        spawnVideoProcess(options);
                    });
                } else {
                    spawnVideoProcess(options);
                }
                console.log('Executed script ', options);
            }
        }
    });

    app.get('/download', (request, response) => {
        const params = (request.query && request.query.filename ? request.query.filename : undefined);
        if (params) {
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            fs.createReadStream(`/tmp/${filename}`).pipe(response);
        } else {
            response.writeHead(404, {});
            response.end('File not found');
        }
    });

    app.get('/saveStream', (request, response) => {
        const params = (request.query && request.query.saveOpts ? request.query.saveOpts : '');
        const options = unescape(params).trim().split(' ').filter(item => {
            return (item && item.length > 0);
        });
        if (ENABLE_RTSP) {
            if (!videoProcess) {
                response.writeHead(503, {});
                response.end('Video process is not running, try /update first.');
            } else {
                saveVideoProcess(options, response)
            }
        } else {
            if (streamProcess) {
                response.writeHead(200, {});
                response.end('Invalid configuration! ENABLE_RTSP is set to false, cannot view and save stream.');
            } else {
                saveVideoProcess(options, response)
            }
        }
    });

    app.get('/preview', (request, response) => {

        const params = (request.query && request.query.previewOpts ? request.query.previewOpts : '');
        const options = unescape(params).trim().split(' ').filter(item => {
            return (item && item.length > 0);
        });
        if (!ENABLE_RTSP || (ENABLE_RTSP && videoProcess)) {
            if (streamProcess) {
                const pid = streamProcess.pid;
                childProcess.exec(`kill -9 ${pid}`, () => {
                    sendVideoProcess(options, response);
                });
            } else {
                sendVideoProcess(options, response);
            }
        } else {
            response.writeHead(200, {});
            response.end('');
        }
    });

    app.get('/', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.end(getHTML(fields));
    });

    const port = 20000;
    const server = http.createServer(app);
    server.listen(port);

    console.log(`Listening on IP: ${ipaddr} and port ${port}`);

    // start rtps streaming
    if (ENABLE_RTSP){
        spawnVideoProcess(DEFAULT_OPTIONS);
    }
}

start();
