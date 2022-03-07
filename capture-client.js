const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    {
        resolve,
        basename
    } = require('path'),
    dns  = require('dns').promises,
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const FILENAME = basename(__filename);
const RESOLVED_FILE_LOCATION = resolve(__filename).replace(`/${FILENAME}`, '');

const { getEnvVar } = require(`${RESOLVED_FILE_LOCATION}/libs/env`),
    stringify = require(`${RESOLVED_FILE_LOCATION}/libs/stringify`),
    {
        getIPAddress,
        getHostname
    } = require(`${RESOLVED_FILE_LOCATION}/libs/utils`),
    {
        BASH_CMD,
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
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION);

const app = express();

const RTSP_HOST = getEnvVar('IP_ADDR', '192.168.50.100');

function getHTML() {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        <iframe id="videoDisplay" width="640" height="480" src="/preview"></iframe>

        <div id="server-messages"></div>
        <br>
        <form name="cameraOptions" onsubmit="return false;">
            <label>Streaming options</label>
            <input type="text" name="previewOptions" size=60">
            <button type="submit" id="saveStream">
                Capture Stream
            </button>
            <br><br>
            <button type="submit" id="startPreview">
                Start Preview
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button type="submit" id="stopPreview">
                Stop Preview
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

async function start() {

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);
    process.env.IP_ADDR = RTSP_HOST;

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

    app.get('/download', (request, response) => {
        const filename = (request.query && request.query.filename ? request.query.filename : undefined);
        if (filename) {
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            fs.createReadStream(`${process.env.HOME}/images/${filename}`).pipe(response);
        } else {
            response.writeHead(404, {});
            response.end('File not found!');
        }
    });

    app.get('/saveStream', (request, response) => {
        const params = (request.query && request.query.saveOpts ? request.query.saveOpts : '');
        const options = unescape(params).trim().split(' ').filter(item => {
            return (item && item.length > 0);
        });
        if (global.streamProcess) {
            response.writeHead(200, {});
            response.end('Invalid configuration, cannot view and save stream.');
        } else {
            saveVideoProcess(options, response)
        }
    });

    app.get('/stopPreview', (request, response) => {

        if (global.streamProcess) {
            const pid = global.streamProcess.pid;
            childProcess.exec(`kill -9 ${pid}`, () => {
                childProcess.exec(`/bin/bash ${FFMPEG_RUNNING_CMD}`, () => {
                    // TODO check status of command
                    response.writeHead(200, {});
                    response.end('Preview should have stopped.');
                    return;
                });
            });
            return;
        }
        response.writeHead(200, {});
        response.end('Nothing happened!');
    });

    app.get('/preview', (request, response) => {

        const params = (request.query && request.query.previewOpts ? request.query.previewOpts : '');
        const options = unescape(params).trim().split(' ').filter(item => {
            return (item && item.length > 0);
        });
        console.log('Running preview with: ', options)
        if (global.streamProcess) {
            const pid = global.streamProcess.pid;
            childProcess.exec(`kill -9 ${pid}`, () => {
                sendVideoProcess(options, response);
            });
        } else {
            sendVideoProcess(options, response);
        }
    });

    app.get('/', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.end(getHTML());
    });

    const port = 20000;
    const server = http.createServer(app);
    server.listen(port);

    console.log(`Listening on IP: ${ipaddr} and port ${port}`);
}

start();
