const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const app = express();

let videoProcess,
    streamProcess;

const BASH_CMD = '/bin/bash';
const VIDEO_CMD = '/home/pi/pi-camera/rtspStream.sh';
const MJPEG_CMD = '/home/pi/pi-camera/mjpegRestream.sh';

function getHTML(body) {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        <iframe width="640" height="480" src="/preview"></iframe>
        
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

function spawnVideoProcess(options) {

    options.unshift(VIDEO_CMD);
    videoProcess = childProcess.spawn(BASH_CMD, options, {
        env : process.env
    });
    videoProcess.stdout.on('data', (data) => {
        console.log(`${VIDEO_CMD}: ${data}`);
    });
}

function sendVideoProcess(options, response) {
    options.unshift(MJPEG_CMD);
    streamProcess = childProcess.spawn(BASH_CMD, options);
    response.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
        'Cache-Control': 'no-cache'
    });
    streamProcess.stdout.pipe(response);
}

async function start() {

    const baseDir = process.cwd();
    const config = require(`${baseDir}/cameraConfig`);

    const formFields = await import('./libs/form.mjs');

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

    app.get('/preview', (request, response) => {

        const options = Object.keys(request.body).filter(item => {
            return (item && item.length > 0);
        });
        if (videoProcess) {
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

    const server = http.createServer(app);
    server.listen(20000);

    // start rtps streaming
    spawnVideoProcess([]);
}

start();
