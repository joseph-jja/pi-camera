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
        getVideoUpdateOptions,
        getImageUpdateOptions
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION),
    importWrapper = require(`${RESOLVED_FILE_LOCATION}/libs/importWrapper`),
    imageListAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/imageList`),
    imageUpdateAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/imageUpdate`),
    jsFilesAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/jsFiles`),
    shutdownAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/shutdown`),
    updateXHRAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/update`);

const jsLibFiles = fs.readdirSync(`${RESOLVED_FILE_LOCATION}/js/libs`).map(item => {
    return `/js/libs/${item}`;
});

const jsFiles = fs.readdirSync(`${RESOLVED_FILE_LOCATION}/js`).map(item => {
    return `/js/${item}`;
}).concat(jsLibFiles);

const videoConfig = require(`${RESOLVED_FILE_LOCATION}/videoConfig`),
    imageConfig = require(`${RESOLVED_FILE_LOCATION}/stillConfig`);

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

async function getFormData() {
    const formFields = await importWrapper('./libs/form.mjs');

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

    return {
        fields,
        imageFields
    };
}

async function start() {

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);
    process.env.IP_ADDR = ipaddr;

    const {
        fields,
        imageFields
    } = await getFormData();

    app.get(jsFiles, jsFilesAction);

    app.post('/shutdown', shutdownAction);

    app.post('/update', updateXHRAction);

    app.post('/imageUpdate', imageUpdateAction);

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
        saveVideoProcess(getVideoUpdateOptions(), response);
    });

    app.get('/saveImage', (request, response) => {
        saveImagesData(getImageUpdateOptions(), response);
    });

    app.get('/canvas', (request, response) => {
        fs.createReadStream(`${RESOLVED_FILE_LOCATION}/views/video.html`).pipe(response);
    });

    app.get('/imageList', imageListAction);

    app.post('/startPreview', (request, response) => {

        response.writeHead(200, {});
        response.end('Preview has started on ' + new Date());
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
        saveRawVideoData(getVideoUpdateOptions(), response, videoConfig);
    });

    app.get('/config', (request, response) => {
        response.writeHead(200, {});
        response.end(stringify(getVideoUpdateOptions()) + ' ' );
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
