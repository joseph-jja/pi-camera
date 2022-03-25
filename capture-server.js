const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    {
        resolve,
        basename
    } = require('path'),
    { pipeline } = require('stream'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const FILENAME = basename(__filename);
const RESOLVED_FILE_LOCATION = resolve(__filename).replace(`/${FILENAME}`, '');

const stringify = require(`${RESOLVED_FILE_LOCATION}/libs/stringify`),
    {
        getIPAddress,
        getHostname,
        listImageFiles
    } = require(`${RESOLVED_FILE_LOCATION}/libs/utils`),
    logger = require(`${RESOLVED_FILE_LOCATION}/libs/logger`)(__filename),
    {
        DEFAULT_OPTIONS,
        //spawnVideoProcess,
        saveRawVideoData,
        saveVideoProcess,
        saveImagesData,
        directStream,
        getVideoFilename
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
        <iframe id="videoDisplay" width="640" height="480" src="/preview"></iframe>
        <div id="server-messages"></div>
        <br>
        <label>Streaming options</label>
        <br>
        <fieldset style="width: 450px; height: 650px; float: left;">
            <form name="cameraOptions" onsubmit="return false;">
                <input type="text" name="previewOptions" size=60">
                <br>
                <br>
                ${body}
                <br><br>
                <button type="submit" id="updateButton">
                    Update
                </button>
                <br><br>
                <button type="submit" id="saveStream">
                    Capture Stream
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <button type="submit" id="saveRawStream">
                    Capture RAW Stream
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
        </fieldset>
        <fieldset style="width: 275px; height: 650px; float: left;">
            <form name="imageFiles" onsubmit="return false;">
                <div id="image-files"></div>
            </form>
            <br><br>
            <button type="submit" id="listCaptures">
                List Captures
            </button>
        </fieldset>
        <br clear="both">
        <fieldset style="width: 90%; float: none;">
            <form name="shutdown" onsubmit="return false;">
                <button type="submit" id="shutdownButton">
                    Shutdown
                </button>
            </form>
        </fieldset>
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
        } else if (item.value) {
            return formFields.checkboxField(item);
        } else {
            logger.info(`${stringify(item)}`);
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

    const filterRequestBody = (body) => {
        return Object.keys(body).filter(item => {
            return (item && item.length > 0);
        });
    };

    let lastUpdateOpts = DEFAULT_OPTIONS;
    app.post('/update', (request, response) => {
        if (request.body && Object.keys(request.body).length > 0) {
            const options = filterRequestBody(request.body);
            if (options.length > 0) {
                const spawnOpts = options.map(item => {
                    return item.split(' ');
                }).reduce((acc, next) => acc.concat(next));
                lastUpdateOpts = spawnOpts;
                if (global.directStreamProcess) {
                    const pid = global.directStreamProcess.pid;
                    childProcess.exec(`kill -9 ${pid}`, () => {
                        global.directStreamProcess = undefined;
                        directStream(spawnOpts);
                    });
                } else {
                    directStream(spawnOpts);
                }
                response.writeHead(200, {});
                const message = `Executed script with options ${stringify(spawnOpts)}`;
                response.end(message);
                logger.info(message);
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
                    logger.info('Preview should have stopped.');
                });
            });
            return;
        }
        response.writeHead(200, {});
        response.end('Nothing happened!');
    });

    app.get('/saveStream', (request, response) => {
        saveVideoProcess(lastUpdateOpts, response);
    });

    app.get('/saveImage', (request, response) => {
        saveImagesData(lastUpdateOpts, response);
    });

    app.get('/imageList', (request, response) => {

        listImageFiles(`${process.env.HOME}/images/`)
            .then(filedata => {
                if (filedata.hasError) {
                    response.writeHead(500, {
                        'Content-Type': 'text/html'
                    });
                    response.end(stringify(filedata.message));
                    return;
                }
                const selectData = {
                    name: 'image_list',
                    paramName: '',
                    comment: 'Select an image to delete or download or rename',
                    values: filedata.message
                };
                logger.verbose(`Got select data ${stringify(selectData)}`);
                const htmlForm = formFields.buildSelect(selectData);
                logger.verbose(`Got html form data ${stringify(htmlForm)}`);
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.end(htmlForm);
            }).catch(e => {
                response.writeHead(500, {
                    'Content-Type': 'text/html'
                });
                response.end(stringify(e));
            });
    });

    app.post('/startPreview', (request, response) => {
        const hasRequestData = (request.body && Object.keys(request.body).length > 0);
        const options = hasRequestData ? filterRequestBody(request.body) : lastUpdateOpts.concat();

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
        if (!global.directStreamProcess) {
            response.writeHead(200, {});
            response.end('Preview service is not running!');
            return;
        }
        response.writeHead(200, {
            //'Content-Type': 'video/webm',
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
        });
        pipeline(global.directStreamProcess.stdout, response,
            (err) => {
            if (err) {
              logger.error(`Stream error ${stringify(err)}`);
            } else {
              logger.info('Stream end');
            }
          })
        /*global.directStreamProcess.stdout.on('data', (d) => {
            response.write(d);
            //logger.info(`Got data ${d.length}`);
        });
        global.directStreamProcess.stdout.on('error', (e) => {
            logger.error(`Stream error ${stringify(e)}`);
        });
        global.directStreamProcess.stdout.on('close', () => {
            logger.info('Stream closed');
        });
        global.directStreamProcess.stdout.on('end', () => {
            logger.info('Stream end');
        });*/
    });

    app.get('/saveRawStream', (request, response) => {
        saveRawVideoData(lastUpdateOpts, response);
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

    logger.info(`Listening on IP: ${ipaddr} and port ${port}`);

    // start rtps streaming
    //spawnVideoProcess(DEFAULT_OPTIONS);
    directStream(DEFAULT_OPTIONS);
}

start();
