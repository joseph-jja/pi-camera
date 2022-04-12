const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    { randomBytes } = require('crypto'),
    {
        resolve,
        basename
    } = require('path'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser'),
    {
        Server
    } = require("socket.io");

const FILENAME = basename(__filename);
const RESOLVED_FILE_LOCATION = resolve(__filename).replace(`/${FILENAME}`, '');

const pageUUID = /\[\[PAGE_UUID\]\]/g;

process.on('uncaughtException', (e) => {
    console.error(e);
});

const stringify = require(`${RESOLVED_FILE_LOCATION}/libs/stringify`),
    {
        getIPAddress,
        getHostname
    } = require(`${RESOLVED_FILE_LOCATION}/libs/utils`),
    logger = require(`${RESOLVED_FILE_LOCATION}/libs/logger`)(__filename),
    {
        saveRawVideoData,
        saveVideoProcess,
        saveImagesData,
        directStream,
        getVideoUpdateOptions,
        getImageUpdateOptions
    } = require(`${RESOLVED_FILE_LOCATION}/libs/videoScripts`)(RESOLVED_FILE_LOCATION),
    previewStreamAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/previewStream`)(RESOLVED_FILE_LOCATION),
    socketStreamAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/socketStream`)(RESOLVED_FILE_LOCATION),
    stopPreviewAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/stopPreview`)(RESOLVED_FILE_LOCATION),
    imageUpdateAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/imageUpdate`)(RESOLVED_FILE_LOCATION),
    renameFileAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/renameFile`)(RESOLVED_FILE_LOCATION),
    viewImageOrVideoAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/viewImageOrVideo`)(RESOLVED_FILE_LOCATION),
    deleteFileAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/deleteFile`)(RESOLVED_FILE_LOCATION),
    jsFilesAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/jsFiles`),
    shutdownAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/shutdown`),
    updateXHRAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/update`)(RESOLVED_FILE_LOCATION);

const app = express();
app.disable('x-powered-by');

const port = 20000;
const server = http.createServer(app);
const io = new Server(server);

const jsLibFiles = fs.readdirSync(`${RESOLVED_FILE_LOCATION}/js/libs`).map(item => {
    return `/js/libs/${item}`;
});

const jsMjpegFiles = fs.readdirSync(`${RESOLVED_FILE_LOCATION}/js/mjpeg`).map(item => {
    return `/js/mjpeg/${item}`;
});

const jsFiles = fs.readdirSync(`${RESOLVED_FILE_LOCATION}/js`).map(item => {
    return `/js/${item}`;
}).concat(jsLibFiles).concat(jsMjpegFiles);

const videoConfig = require(`${RESOLVED_FILE_LOCATION}/libs/libcamera/videoConfig`),
    imageConfig = require(`${RESOLVED_FILE_LOCATION}/libs/libcamera/stillConfig`);

const VIDEO_HTML = fs.readFileSync(`${RESOLVED_FILE_LOCATION}/views/capture.html`).toString();

function getHTML(videoBody, imageBody) {
    return VIDEO_HTML.replace('[[VIDEO_FORM]]', videoBody).replace('[[IMAGE_FORM]]', imageBody);
}

app.use(bodyParser.urlencoded({
    extended: false,
    limit: 100000
}));

async function getFormData() {
    const formFields = await import('./libs/form.mjs');

    const formBuilder = item => {

        if (item.values) {
            return formFields.buildSelect(item);
        } else if (item.multiRange) {
            const ranges = item.multiRange.ranges.map((range, index) => {
                const rangeItem = {
                    step: item.step,
                    decimalPlaces: item.decimalPlaces,
                    range: range
                };
                const values = formFields.getRangeValues(rangeItem);
                if (index === 0) {
                    const ritem = Object.assign({}, item, {
                        values
                    });
                    delete ritem.comment;
                    return formFields.buildSelect(ritem);
                } else {
                    const ritem = Object.assign({}, item, {
                        values
                    });
                    delete ritem.name;
                    ritem.paramName = item.multiRange.joinedBy;
                    return formFields.buildSelect(ritem);
                }
            }).reduce((acc, next) => {
                return `${acc} ${next}`;
            });
            return ranges;
        } else if (item.range) {
            const values = formFields.getRangeValues(item);
            const ritem = Object.assign({}, item, {
                values
            });
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
        imageFields,
        formFields
    };
}

async function start() {

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);
    process.env.IP_ADDR = ipaddr;

    const {
        fields,
        imageFields,
        formFields
    } = await getFormData();

    const imageListAction = require(`${RESOLVED_FILE_LOCATION}/xhrActions/imageList`)(RESOLVED_FILE_LOCATION, formFields);

    app.get(jsFiles, jsFilesAction);

    app.post('/shutdown', shutdownAction);

    app.post('/update', updateXHRAction);

    app.post('/imageUpdate', imageUpdateAction);

    app.post('/startPreview', (request, response) => {

        response.writeHead(200, {});
        response.end('Preview has started on ' + new Date());
    });

    app.get('/stopPreview', stopPreviewAction);

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

    app.get('/preview', previewStreamAction);

    app.get('/renameFile', renameFileAction);

    app.get('/deleteFile', deleteFileAction);

    app.get('/viewImageOrVideo', viewImageOrVideoAction);

    app.get('/saveRawStream', (request, response) => {
        saveRawVideoData(getVideoUpdateOptions(), response, videoConfig);
    });

    app.get('/config', (request, response) => {
        const uuid = randomBytes(26).toString('hex');
        response.writeHead(200, {
            'Content-Type': 'appllication/json',
            'x-uuid': uuid
        });
        response.end(stringify(getVideoUpdateOptions()) + ' ');
    });

    app.get('/', (request, response) => {
        const uuid = randomBytes(26).toString('hex');
        response.writeHead(200, {
            'Content-Type': 'text/html',
            'x-uuid': uuid
        });
        response.end(getHTML(fields, imageFields).replace(pageUUID, uuid));
    });

    app.get('/js/socket.io.js', (request, response) => {
        fs.createReadStream('node_modules/socket.io/client-dist/socket.io.min.js').pipe(response);
    });

    io.on('connection', (socket) => {
        logger.info(`Socket has connected with ID: ${socket.id}`);
        socketStreamAction(socket);
    });

    server.listen(port);

    logger.info(`Listening on IP: ${ipaddr} and port ${port}`);

    // start rtps streaming
    directStream(getVideoUpdateOptions());
}

start();
