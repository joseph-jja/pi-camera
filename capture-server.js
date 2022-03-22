const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    {
        resolve,
        basename
    } = require('path'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const FILENAME = basename(__filename);
const RESOLVED_FILE_LOCATION = resolve(__filename).replace(`/${FILENAME}`, '');

const stringify = require(`${RESOLVED_FILE_LOCATION}/libs/stringify`),
    {
        getIPAddress,
        getHostname
    } = require(`${RESOLVED_FILE_LOCATION}/libs/utils`),
    {
        DEFAULT_OPTIONS,
        spawnVideoProcess,
        directStream
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION);

const app = express();
app.disable('x-powered-by');

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

    const config = require(`${RESOLVED_FILE_LOCATION}/cameraConfig`);

    const formFields = await import('./libs/form.mjs');
    const params = await import('./libs/params.mjs');
    const {
        filterParams
    } = params;

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

    let lastUpdateOpts = DEFAULT_OPTIONS;
    app.post('/update', (request, response) => {
        if (request.body && Object.keys(request.body).length > 0) {
            const options = Object.keys(request.body).filter(item => {
                return (item && item.length > 0);
            });
            if (options.length > 0) {
                const spawnOpts = options.map(item => {
                    return item.split(' ');
                }).reduce((acc, next) => acc.concat(next));
                lastUpdateOpts = spawnOpts;
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

    app.get('/stopPreview', (request, response) => {
        if (global.directStreamProcess) {
            const pid = global.directStreamProcess.pid;
            childProcess.exec(`kill -9 ${pid}`, () => {
                global.directStreamProcess = undefined;
                childProcess.exec(`kill -9 \`ps -ef | grep libcamera | awk '{print $2}' | grep -v grep \``, () => {
                    response.writeHead(200, {});
                    response.end('Preview should have stopped.');
                    console.log('Preview should have stopped.');
                });
            });
            return;
        }
        response.writeHead(200, {});
        response.end('Nothing happened!');
    });

    app.get('/startpreview', (request, response) => {
        const options = filterParams(request, 'previewOpts');
        if (global.directStreamProcess) {
            const pid = global.directStreamProcess.pid;
            childProcess.exec(`kill -9 ${pid}`, () => {
                global.directStreamProcess = undefined;
                directStream(options);
            });
        } else {
            directStream(options);
        }
        response.writeHead(200, {});
        response.end('Direct preview has started');
    });

    app.get('/preview', (request, response) => {
        response.writeHead(200, {
            //'Content-Type': 'video/webm',
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
        });
        global.directStreamProcess.stdout.on('data', (d) => {
            response.write(d);
            //console.log('Got data', d.length);
        });
    });

    app.get('/config', (request, response) => {
        response.writeHead(200, {});
        response.end(stringify(lastUpdateOpts));
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
    spawnVideoProcess(DEFAULT_OPTIONS);
}

start();
