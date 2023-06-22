import {
    DEFAULT_ASTROMETRY_HEADERS,
    ASTROMETRY_LOGIN_URL
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

const getLoginPayload = apiKey => {
    const apiJSON = {
        "apikey": apiKey
    };
    return `request-json=${encodeURIComponent(JSON.stringify(apiJSON))}`;
};

const getLoginHeaders = () => Object.assign({}, DEFAULT_ASTROMETRY_HEADERS, {
    'Content-Type': 'application/x-www-form-urlencoded'
});

// returns promise 
// given api key it will try to login to astrometry
// success returns session thing
// fail returns error / prommise rejects
// caller must handle the rejection 
export const login = (apiKey) => {
    const payload = getLoginPayload(apiKey);
    const headers = getLoginHeaders();
    const options = getOptions(ASTROMETRY_LOGIN_URL, headers);

    return WebRequest(options, payload).then(res => {
        return res?.data?.session;
    });
};
