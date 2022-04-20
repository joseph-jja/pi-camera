const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    {
        randomBytes
    } = require('crypto'),
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

const basedir = process.cwd();

const pageUUID = /\[\[PAGE_UUID\]\]/g;

process.on('uncaughtException', (e) => {
    console.error(e);
});

const stringify = require(`${basedir}/libs/stringify`),
    {
        getIPAddress,
        getHostname
    } = require(`${basedir}/libs/utils`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        saveRawVideoData,
        saveVideoProcess,
        saveImagesData,
        directStream,
        getVideoUpdateOptions,
        getImageUpdateOptions
    } = require(`${basedir}/libs/videoScripts`),
    previewStreamAction = require(`${basedir}/xhrActions/previewStream`),
    socketStreamAction = require(`${basedir}/xhrActions/socketStream`),
    stopPreviewAction = require(`${basedir}/xhrActions/stopPreview`),
    imageUpdateAction = require(`${basedir}/xhrActions/imageUpdate`),
    renameFileAction = require(`${basedir}/xhrActions/renameFile`),
    viewImageOrVideoAction = require(`${basedir}/xhrActions/viewImageOrVideo`),
    deleteFileAction = require(`${basedir}/xhrActions/deleteFile`),
    jsFilesAction = require(`${basedir}/xhrActions/jsFiles`),
    shutdownAction = require(`${basedir}/xhrActions/shutdown`),
    updateXHRAction = require(`${basedir}/xhrActions/update`),
    imageListAction = require(`${basedir}/xhrActions/imageList`);

const app = express();
app.disable('x-powered-by');

const port = 20000;
const server = http.createServer(app);
const io = new Server(server);

const jsLibFiles = fs.readdirSync(`${basedir}/js/libs`).map(item => {
    return `/js/libs/${item}`;
});

const jsMjpegFiles = fs.readdirSync(`${basedir}/js/mjpeg`).map(item => {
    return `/js/mjpeg/${item}`;
});

const jsFiles = fs.readdirSync(`${basedir}/js`).map(item => {
    return `/js/${item}`;
}).concat(jsLibFiles).concat(jsMjpegFiles);

const videoConfig = require(`${basedir}/libs/libcamera/videoConfig`),
    imageConfig = require(`${basedir}/libs/libcamera/stillConfig`),
    profileConfig = require(`${basedir}/libs/libcamera/configProfiles`);

const VIDEO_HTML = fs.readFileSync(`${basedir}/views/capture.html`).toString();

function getHTML(videoBody, imageBody, profiles) {
    return VIDEO_HTML.replace('[[VIDEO_FORM]]', videoBody)
        .replace('[[IMAGE_FORM]]', imageBody)
        .replace('[[PROFILE_OPTIONS]]', profiles);
}

app.use(bodyParser.urlencoded({
    extended: false,
    limit: 100000
}));

setInterval(() => {
    const memory = process.memoryUsage();
    if (memory.rss > 650000000) {
        console.error('Using too much RAM, killing until restart');
        process.exit(-1);
    }
}, 10000);

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

    const profiles = profileConfig.map(item => {
        const reducedVideo = item.fields.filter(field => {
            return (field.forms.indexOf('videoOptions') > -1);
        }).map(field => {
            return {
                name: field.name,
                value: field.value
            };
        });
        const reducedImage = item.fields.filter(field => {
            return (field.forms.indexOf('imageOptions') > -1);
        }).map(field => {
            return {
                name: field.name,
                value: field.value
            }
        });

        return {
            name: item.name,
            value: {
                videoOptions: reducedVideo,
                imageOptions: reducedImage
            }
        };
    }).map(item => {
        return `<option value="${stringify(item.value)}">${item.name}</option>`;
    }).reduce((acc, next) => {
        return `${acc}${os.EOL}${next}`;
    });

    const fields = videoConfig.map(formBuilder).reduce((acc, next) => {
        return `${acc}<br><br>${os.EOL}${next}`;
    });
    const imageFields = imageConfig.map(formBuilder).reduce((acc, next) => {
        return `${acc}<br><br>${os.EOL}${next}`;
    });

    return {
        fields,
        imageFields,
        formFields,
        profiles
    };
}

async function start() {

    const hostname = (await getHostname()).trim();
    const ipaddr = await getIPAddress(hostname);
    process.env.IP_ADDR = ipaddr;

    const {
        fields,
        imageFields,
        formFields,
        profiles
    } = await getFormData();

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
        saveImagesData(request, response);
    });

    app.get('/imageList', (request, response) => {
        imageListAction(request, response, formFields);
    });

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
        response.end('[' + stringify(getVideoUpdateOptions()) + ', ' + stringify(getImageUpdateOptions()) + ']');
    });

    app.get('/', (request, response) => {
        const uuid = randomBytes(26).toString('hex');
        response.writeHead(200, {
            'Content-Type': 'text/html',
            'x-uuid': uuid
        });
        response.end(getHTML(fields, imageFields, profiles).replace(pageUUID, uuid));
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
