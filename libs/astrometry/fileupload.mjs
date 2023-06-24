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

import {
    createRequire
} from "module";
const require = createRequire(import.meta.url);

const basedir = process.cwd(),
    WebRequest = require(`${basedir}/libs/WebRequest`);

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

const getPayloadData = (boundary, payload, filename, filedata) => {

    const prebuff = [];
    prebuff.push(`--${boundary}${CRLF}`);
    prebuff.push(FIRST_PART_CONTENT_TYPE);
    prebuff.push(MIME_VERSION);
    prebuff.push(FIRST_PART_CONTENT_DISPOSITION);
    prebuff.push(payload);
    prebuff.push(`${CRLF}${CRLF}--${boundary}${CRLF}`);

    prebuff.push(SECOND_PART_CONTENT_TYPE);
    prebuff.push(MIME_VERSION);
    prebuff.push(SECOND_PART_CONTENT_DISPOSITION(filename));

    return Buffer.concat([Buffer.from(prebuff.join(''), 'ascii'),
        Buffer.from(filedata, 'binary'),
        Buffer.from(`${LF}--${boundary}--${LF}`, 'ascii')
    ]);
}

const getUploadPayload = session => {
    const uploadPayload = Object.assign({}, 
        DEFAULT_ASTROMETRY_UPLOAD_PAYLOAD, {
            'session': session
        });
    return JSON.stringify(uploadPayload);
};

export const upload = async (session, filename) => {

    const {
        ...headers
    } = DEFAULT_ASTROMETRY_HEADERS;
    const uploadOptions = getOptions(ASTROMETRY_UPLOAD_URL, headers);

    const authData = getUploadPayload(session);

    fs.readFile(filename, {encoding: 'binary'}, (err, filedata) => {
        if (!err) {
            const bodyMsg = getPayloadData(BOUNDARY, authData, filename, filedata);
            return WebRequest(uploadOptions, authData, bodyMsg, BOUNDARY).then(results => {
                // TODO what do we need from this?
                if (results.status === 'success' && results.subid) {
                    return results.subid;
                }
                return Promise.reject(results);
            });
        }
        Promise.reject(err);
    });
};
    