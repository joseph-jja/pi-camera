import {
    DEFAULT_ASTROMETRY_HEADERS,
    ASTROMETRY_SUBISSIONS_URL,
    ASTROMETRY_JOBS_ANNOTATIONS_URL,
    ASTROMETRY_JOBS_INFO_URL,
    ASTROMETRY_JOBS_STATUS_URL,
    ASTROMETRY_SUBMISSION_PENDING,
    ASTROMETRY_SUBMISSION_STARTED,
    ASTROMETRY_SUBMISSION_COMPLETED
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

    return WebRequest(submissionOptions, '').then(resp => {
        const results = resp?.data || {};
        const jobs = results.jobs;
        const calibrations = results['job_calibrations'];
        const hasJobs = jobs && Array.isArray(jobs) && jobs.length > 0;
        const hasCalibrations = calibrations && Array.isArray(calibrations) && calibrations.length > 0;
                
        if (hasCalibrations) {
            return {
                'status': ASTROMETRY_SUBMISSION_COMPLETED,
                data: results.data
            };
        } else if (hasJobs) {
            return {
                'status': ASTROMETRY_SUBMISSION_STARTED,
                data: results.data
            };
        } else {
        return {
            'status': ASTROMETRY_SUBMISSION_PENDING,
            data: results.data
        };
    }
    });
};

export const jobAnnotations = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_ANNOTATIONS_URL(jobId));

    return WebRequest(jobOptions, '').then(results => results.data?.status);
};

export const jobStatus = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_STATUS_URL(jobId));

    // this is simple, it has a status field :) 
    return WebRequest(jobOptions, '').then(results => results.data);
};

export const jobInfo = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_INFO_URL(jobId));

    // this is simple, as we want more data
    return WebRequest(jobOptions, '').then(results => results.data);
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
        return WebRequest(options, '').then(results => results.data);
    });

    return Promise.all(apiCalls);
}*/

