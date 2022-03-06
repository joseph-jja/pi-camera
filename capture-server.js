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
        spawnVideoProcess,
        sendVideoProcess,
        saveVideoProcess
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION);

const app = express();

const ENABLE_RTSP = getEnvVar(process.env.ENABLE_RTSP, true);

function getHTML(body) {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        <div id="server-messages"></div>
        <br>
        <form name="cameraOptions" onsubmit="return false;">
            ${body}
            <br>
            <button type="submit" id="updateButton">
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
