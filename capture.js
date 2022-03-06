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
        DEFAULT_OPTIONS,
        VIDEO_CMD,
        MJPEG_CMD,
        SAVE_CMD,
        COMBINED_CMD,
        FFMPEG_RUNNING_CMD,
        FFMPEG_RTSP_COPY_CMD,
        getVideoFilename,
        spawnVideoProcess
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION);

const app = express();

const ENABLE_RTSP = getEnvVar(process.env.ENABLE_RTSP, true);

let streamProcess;

function getHTML(body) {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        <iframe id="videoDisplay" width="640" height="480" src="/defaultPreview"></iframe>

        <div id="server-messages"></div>
        <br>
        <form name="cameraOptions" onsubmit="return false;">
            ${body}
            <br>
            <button type="submit" id="updateButton">
                Update
            </button>
            <br><br>
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
        <!--
        <br><br>
        <form name="imageCapture" onsubmit="return false;">
            <select name="imageCapture">
                <option value="0.2">1/2 second</option>
                <option value="0.03">1/30 second</option>
                <option value="0.25">1/4 second</option>
                <option value="0.06">1/6 second</option>
            </select>
            <button type="submit" id="imageCapture">
                Image Capture
            </button>
        </form>
        -->
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

    const filename = getVideoFilename();

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

async function start() {

    const baseDir = process.cwd();
    const config = require(`${RESOLVED_FILE_LOCATION}/cameraConfig`);

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
        if (!ENABLE_RTSP) {
            response.writeHead(200, {});
            response.end('RTSP not enabled, nothing to do!');
            return;
        }
        if (request.body && Object.keys(request.body).length > 0) {
            const options = Object.keys(request.body).filter(item => {
                return (item && item.length > 0);
            });
            if (options.length > 0) {
                const spawnOpts = options.map(item => {
                    return item.split(' ');
                }).reduce((acc, next) => acc.concat(next));
                if (global.videoProcess) {
                    const pid = global.videoProcess.pid;
                    childProcess.exec(`kill -9 ${pid}`, () => {
                        global.videoProcess = undefined;
                        spawnVideoProcess(spawnOpts);
                    });
                } else {
                    spawnVideoProcess(spawnOpts);
                }
                response.writeHead(200, {});
                response.end(`Executed script with options ${stringify(spawnOpts)}`);
                console.log('Executed script with options', spawnOpts);
            }
        } else {
            response.writeHead(200, {});
            response.end('No changes applied!');
        }
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
        if (ENABLE_RTSP) {
            if (!global.videoProcess) {
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

    app.get('/stopPreview', (request, response) => {

        if (!ENABLE_RTSP || (ENABLE_RTSP && global.videoProcess)) {
            if (streamProcess) {
                const pid = streamProcess.pid;
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
        }
        response.writeHead(200, {});
        response.end('Nothing happened!');
    });

    app.get('/defaultPreview', (request, response) => {
        response.writeHead(200, {});
        response.end('Click preview to start the preview!');
    });

    app.get('/preview', (request, response) => {

        const params = (request.query && request.query.previewOpts ? request.query.previewOpts : '');
        const options = unescape(params).trim().split(' ').filter(item => {
            return (item && item.length > 0);
        });
        if (!ENABLE_RTSP || (ENABLE_RTSP && global.videoProcess)) {
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
            response.end('Nothing saved!');
        }
    });

    app.get('/rtspPreview', (request, response) => {
        // TODO fix this
        const restream = childProcess.spawn(BASH_CMD, [FFMPEG_RTSP_COPY_CMD]);
        response.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
        });
        restream.stdout.pipe(response);
        response.on('close', () => {
            const pid = restream.pid;
            childProcess.exec(`kill -9 ${pid}`, () => {
                console.log('Done!');
            });
        });
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
