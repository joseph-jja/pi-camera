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

export const upload = (session, filename) => {

    const {
        ...headers
    } = DEFAULT_ASTROMETRY_HEADERS;
    const uploadOptions = getOptions(uploadURL, headers);

    const authData = getUploadPayload(session);

    fs.readFile(filename, {encoding: 'binary'}, (err, data) => {
        if (!err) {
            WebRequest(uploadOptions, authData, filename, data).then(status => {
                console.log(status);
            }).catch(xerr => {
                console.log(xerr);
            });
            return;
        }
        console.log(err);
    });
};
    