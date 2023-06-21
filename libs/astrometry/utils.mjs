import {
    ASTROMETRY_HOST,
    ASTROMETRY_PORT
} from '#libs/astrometry/constants.mjs';

export const getOptions = (url, headers) => {

    return {
        host: ASTROMETRY_HOST,
        port: ASTROMETRY_PORT,
        path: url,
        method: 'POST',
        headers: headers
    };
};
