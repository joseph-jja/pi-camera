import fs from 'fs';

import {
    DEFAULT_ASTROMETRY_HEADERS,
    ASTROMETRY_UPLOAD_URL
} from '#libs/astrometry/constants.mjs';
import {
    getOptions
} from '#libs/astrometry/utils.mjs';

import {
    resolve,
    basename
} from 'path';

const filename = basename(resolve(import.meta.url));

import {
    createRequire
} from "module";
const require = createRequire(import.meta.url);

const basedir = process.cwd(),
    WebRequest = require(`${basedir}/libs/WebRequest`),
    logger = require(`${basedir}/libs/logger`)(filename);

const DEFAULT_ASTROMETRY_UPLOAD_PAYLOAD = {
    'allow_commercial_use': 'n',
    'allow_modifications': 'n',
    'publicly_visible': 'n'
};
    
const BOUNDARY = `===============${Date.now()}==`;

const CRLF = '\r\n';
const LF = '\n';
const MIME_VERSION = `MIME-Version: 1.0${CRLF}`;
const FIRST_PART_CONTENT_TYPE = `Content-Type: text/plain${CRLF}`;
const SECOND_PART_CONTENT_TYPE = `Content-Type: application/octet-stream${CRLF}`;
const FIRST_PART_CONTENT_DISPOSITION = `Content-Disposition: form-data; name="request-json"${CRLF}${CRLF}`;
const SECOND_PART_CONTENT_DISPOSITION = filename => `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}${CRLF}`;

const getPayloadData = (session, filename, filedata) => {

    const uploadPayload = Object.assign({}, 
        DEFAULT_ASTROMETRY_UPLOAD_PAYLOAD, {
            'session': session
        });

    const prebuff = [];
    prebuff.push(`--${BOUNDARY}${CRLF}`);
    prebuff.push(FIRST_PART_CONTENT_TYPE);
    prebuff.push(MIME_VERSION);
    prebuff.push(FIRST_PART_CONTENT_DISPOSITION);
    prebuff.push(JSON.stringify(uploadPayload));
    prebuff.push(`${CRLF}${CRLF}--${BOUNDARY}${CRLF}`);

    prebuff.push(SECOND_PART_CONTENT_TYPE);
    prebuff.push(MIME_VERSION);
    prebuff.push(SECOND_PART_CONTENT_DISPOSITION(filename));

    return Buffer.concat([Buffer.from(prebuff.join(''), 'ascii'),
        Buffer.from(filedata, 'binary'),
        Buffer.from(`${LF}--${BOUNDARY}--${LF}`, 'ascii')
    ]);
}

export const upload = async (session, filename) => {

    const {
        ...headers
    } = DEFAULT_ASTROMETRY_HEADERS;

    headers['Content-Type'] = `multipart/form-data; boundary=${BOUNDARY}`;

    fs.readFile(filename, {encoding: 'binary'}, (err, filedata) => {
        if (!err) {
            const uploadOptions = getOptions(ASTROMETRY_UPLOAD_URL, headers);
            const bodyMsg = getPayloadData(session, filename, filedata);

            // need content length headers
            uploadOptions.headers['Content-Length'] = bodyMsg.length;
            logger.info(`Content Length: ${uploadOptions.headers['Content-Length']}`);

            return WebRequest(uploadOptions, bodyMsg, BOUNDARY).then(results => {
                // TODO what do we need from this?
                if (results.status === 'success' && results.subid) {
                    return Promise.resolve(results.subid);
                }
                return Promise.reject(results);
            }).catch(e => {
                return Promise.reject(e);
            });
            return;
        }
        return Promise.reject(err);
    });
};
    
