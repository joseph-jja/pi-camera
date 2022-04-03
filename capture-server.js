const os = require('os'),
    fs = require('fs'),
    { randomUUID } = require('crypto'),
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
        getHostname,
        listImageFiles
    } = require(`${RESOLVED_FILE_LOCATION}/libs/utils`),
    logger = require(`${RESOLVED_FILE_LOCATION}/libs/logger`)(__filename),
    {
        DEFAULT_OPTIONS,
        saveRawVideoData,
        saveVideoProcess,
        saveImagesData,
        previewProcess,
        directStream,
        getVideoFilename
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION);

const app = express();
app.disable('x-powered-by');

const VIDEO_HTML = fs.readFileSync(`${RESOLVED_FILE_LOCATION}/views/capture.html`).toString();

function getHTML(videoBody, imageBody) {
    return VIDEO_HTML.replace('[[VIDEO_FORM]]', videoBody).replace('[[IMAGE_FORM]]', imageBody);
}

app.use(bodyParser.urlencoded({
    extended: false,
    limit: 100000
}));

const previewProcesses = {};

async function start() {

    const jsFiles = fs.readdirSync(`${RESOLVED_FILE_LOCATION}/js`).map(item => {
        return `/js/${item}`;
    });
    console.log(jsFiles);

    const videoConfig = require(`${RESOLVED_FILE_LOCATION}/videoConfig`),
        imageConfig = require(`${RESOLVED_FILE_LOCATION}/stillConfig`);

    const formFields = await import('./libs/form.mjs');

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);
    process.env.IP_ADDR = ipaddr;

    const formBuilder = item => {

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
    };
    const fields = videoConfig.map(formBuilder).reduce((acc, next) => {
        return `${acc}<br><br>${os.EOL}${next}`;
    });
    const imageFields = imageConfig.map(formBuilder).reduce((acc, next) => {
        return `${acc}<br><br>${os.EOL}${next}`;
    });

    app.get(jsFiles, (request, response) => {
        const baseFileName = request.url.replace(/\/js\//, '');
        response.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        fs.createReadStream(`js/${baseFileName}`).pipe(response);
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
        try {
            childProcess.execSync(`kill -9 \`ps -ef | grep previewStream | awk '{print $2}' | grep -v grep \``);
            childProcess.exec(`kill -9 \`ps -ef | grep "filter:v fps" | awk '{print $2}' | grep -v grep \``);
            logger.info('Killed all preview processes');
        } catch(e) {
            logger.info('Nothing happened!');
        }
        response.writeHead(200, {});
        response.end('Preview should have stopped.');
        logger.info('Preview should have stopped.');
    });

    app.get('/saveStream', (request, response) => {
        saveVideoProcess(lastUpdateOpts, response);
    });

    app.get('/saveImage', (request, response) => {
        saveImagesData(lastUpdateOpts, response);
    });

    app.get('/canvas', (request, response) => {
        fs.createReadStream(`${RESOLVED_FILE_LOCATION}/views/video.html`).pipe(response);
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

        response.writeHead(200, {});
        response.end('Preview has started');
    });

    app.get('/preview', (request, response) => {
        if (!global.directStreamProcess) {
            response.writeHead(200, {});
            response.end('Preview service is not running!');
            return;
        }
        //const uuid = randomUUID();
        //previewProcesses[uid] = {};
        response.writeHead(200, {
            //'Content-Type': 'video/webm',
            'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
            'Cache-Control': 'no-cache'
            //'x-user-id': uuid
        });

        const previewCmd = previewProcess();
        const previewCmdCB = (d) => {
            response.write(d);
        };
        const globalStreamPreview = (d) => {
            previewCmd.stdin.write(d);
        };
        response.on('close', () => {
            global.directStreamProcess.stdout.off('data', globalStreamPreview);
            previewCmd.stdout.off('data', previewCmdCB);
            childProcess.exec(`kill -9 ${previewCmd.pid}`);
        });
        previewCmd.stdout.on('data', previewCmdCB);

        global.directStreamProcess.stdout.on('data', globalStreamPreview);

        global.directStreamProcess.stdout.once('error', (e) => {
            logger.error(`Stream error ${stringify(e)}`);
        });
        global.directStreamProcess.stdout.once('close', () => {
            logger.info('Stream closed');
        });
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
        response.end(getHTML(fields, imageFields));
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
