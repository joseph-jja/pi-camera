import {
    DEFAULT_ASTROMETRY_HEADERS,
    ASTROMETRY_SUBISSIONS_URL,
    ASTROMETRY_JOBS_ANNOTATIONS_URL,
    ASTROMETRY_JOBS_INFO_URL,
    ASTROMETRY_JOBS_STATUS_URLD
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
    {
        safelyParse
    } = require(`${basedir}/libs/utils`),
    WebRequest = require(`${basedir}/libs/WebRequest`);

const buildRequest = (url) => {

    const {
        ...headers
    } = DEFAULT_ASTROMETRY_HEADERS;

    headers.method = 'GET';

    return getOptions(url, headers);
};

export const submissionStatus = (submissionID) => {

    const submissionOptions = buildRequest(ASTROMETRY_SUBISSIONS_URL(submissionID));

    return WebRequest(submissionOptions).then(resp => {
        if (resp && resp.data) {
            return resp.data;
        } else {
            return {};
        }
    });
};

export const jobAnnotations = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_ANNOTATIONS_URL(jobId));

    return WebRequest(jobOptions).then(results => results.data?.status);
};

export const jobStatus = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_STATUS_URL(jobId));

    // this is simple, it has a status field :) 
    return WebRequest(jobOptions).then(results => results.data);
};

export const jobInfo = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_INFO_URL(jobId));

    // this is simple, as we want more data
    return WebRequest(jobOptions).then(results => results.data);
};

/*
// this can get all the different generated files
// or selected can be specified, not sure which would be useful
export const getJobFiles(jobId) {

    const apiCalls = [
        buildRequest(`/wcs_file/${jobId}`),
        buildRequest(`/new_fits_file/${jobId}`),
        buildRequest(`/rdls_file/${jobId}`),
        buildRequest(`/axy_file/${jobId}`),
        buildRequest(`/corr_file/${jobId}`),
        buildRequest(`/annotated_display/${jobId}`),
        buildRequest(`/red_green_image_display/${jobId}`),
        buildRequest(`/extraction_image_display/${jobId}`)
    ].map(options => {
        return WebRequest(options).then(results => results.data);
    });

    return Promise.all(apiCalls);
}*/

