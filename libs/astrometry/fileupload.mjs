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

    fs.readFile(filename, {encoding: 'binary'}, (err, data) => {
        if (!err) {
            return WebRequest(uploadOptions, authData, filename, data).then(results => {
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
    