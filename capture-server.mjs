import {
    resolve,
    basename
} from 'path';

import os from 'os';
import fs from 'fs';
import http from 'http';
import {
    randomBytes
} from 'crypto';

import express from 'express';
import bodyParser from 'body-parser';
import {
    Server
} from 'socket.io';

import {
    uploadAstrometryFile,
    statusCheckAstrometry
} from '#xhrActions/astrometryCheck.mjs';

const filename = basename(resolve(import.meta.url));
    
import {createRequire } from "module";
const require = createRequire(import.meta.url);

const basedir = process.cwd();

const pageUUID = /\[\[PAGE_UUID\]\]/g;

process.on('uncaughtException', (e) => {
    console.error(e);
});


const stringify = require(`${basedir}/libs/stringify`),
    getVideoStreamCommand = require(`${basedir}/libs/libcamera/getVideoStreamCommand`),
    {
        getIPAddress,
        getHostname
    } = require(`${basedir}/libs/utils`),
    logger = require(`${basedir}/libs/logger`)(filename),
    {
        saveVideoData,
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
    convertXHRAction = require(`${basedir}/xhrActions/convertFileFormat`),
    imageListAction = require(`${basedir}/xhrActions/imageList`),
    getProfiles = require(`${basedir}/libs/libcamera/configProfiles`);

import * as formFields from '#libs/form.mjs';

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

let gVideoConfig;
async function getFormData() {

    const {
        videoConfig,
        imageConfig,
        modes
    } = await getVideoStreamCommand();

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

    const profileConfig = await getProfiles();
    const profiles = (profileConfig && profileConfig.length > 0 ? profileConfig.map(item => {
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
        return `<option value="${encodeURIComponent(stringify(item.value))}">${item.name}</option>`;
    }).reduce((acc, next) => {
        return `${acc}${os.EOL}${next}`;
    }) : []);

    const modeKey = modes && Object.keys(modes) ? Object.keys(modes)[0] : undefined;
    const modeData = (modeKey && modes[modeKey] ? modes[modeKey].modes : undefined);

    const xModes = ((modeData && modeData.length > 0) ? modeData.map(mode => {
        const {
            resX,
            resY,
            fps,
            binned,
            resolution
        } = mode;
        const nMode = {};
        nMode.comment = `${resX}x${resY}@${fps} with binning ${binned}`;
        nMode.resolution = resolution;
        return nMode;
    }) : []);

    const modeComment = (xModes && xModes.length > 0) ? xModes.reduce((acc, next) => {
        return {
            comment: `${acc.comment}<br>${next.comment}`
        };
    }) : undefined;

    const modeResolutions = (xModes && xModes.length > 0) ? xModes.map(item => item.resolution) : [];

    const nVideoConfig = videoConfig.map(item => {
        const nItem = Object.assign({}, item);
        if (nItem.name === 'mode' && modeResolutions.length > 0) {
            const nValues = nItem.values.concat(modeResolutions);
            nItem.values = nValues;
            if (modeComment) {
                nItem.comment = modeComment.comment;
            }
        }
        return nItem;
    });

    gVideoConfig = nVideoConfig;

    const fields = nVideoConfig.map(formBuilder).reduce((acc, next) => {
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

    app.get('/saveStream', (request, response) => {
        const codec = (request.query || {}).codec;
        const playCodec = (codec ? decodeURIComponent(codec).split(' ')[0] : 'mjpeg');
        saveVideoData(playCodec, getVideoUpdateOptions(), request, response, gVideoConfig);
    });

    /* astrometry plate solving stuff start */
    // read in config 
    app.get('/uploadAstrometryFile', (request, response) => {
        uploadAstrometryFile(request, response);
    });

    app.get('/statusCheckAstrometry', (request, response) => {
        statusCheckAstrometry(request, response);
    });
    /* astrometry plate solving stuff end */

    app.get('/convertFiles', (request, response) => {
        convertXHRAction(request, response);
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

    app.get('/js/socket.io.esm.min.js', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        fs.createReadStream('node_modules/socket.io/client-dist/socket.io.esm.min.js').pipe(response);
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
