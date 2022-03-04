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

    if (options.length === 0) {
        options.push(DEFAULT_OPTIONS);
    }
    if (ENABLE_RTSP) {
        options.unshift(MJPEG_CMD);
    } else {
        options.unshift(COMBINED_CMD);
    }
    streamProcess = childProcess.spawn(BASH_CMD, options);
    response.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
        'Cache-Control': 'no-cache'
    });
    streamProcess.stdout.pipe(response);
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
            return formFields.buildSelect(item.name, item.paramName, item.values);
        } else if (item.range) {
            const values = formFields.getRangeValues(item.range, item.step, item.decimalPlaces);
            return formFields.buildSelect(item.name, item.paramName, values);
        } else if (item.fieldValue) {
            return formFields.textField(item.name, item.fieldValue);
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
                // TODO - need script to save video
            }
        } else {
            if (streamProcess) {
                response.writeHead(200, {});
                response.end('Invalid configuration! ENABLE_RTSP is set to false, cannot view and save stream.');
            } else {
                // TODO - need script to save video
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
