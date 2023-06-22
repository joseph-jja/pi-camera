import {
    DEFAULT_ASTROMETRY_HEADERS,
    ASTROMETRY_SUBISSIONS_URL,
    ASTROMETRY_JOBS_URL,
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

const filename = basename(resolve(import.meta.url));

import {
    createRequire
} from "module";
const require = createRequire(import.meta.url);

const basedir = process.cwd(),
    WebRequest = require(`${basedir}/libs/WebRequest`);

const buildRequest = (url) => {

    const {
        ...headers
    } = DEFAULT_ASTROMETRY_HEADERS;

    return getOptions(url, headers);
};

export const submissionStatus = (submissionID) => {

    const submissionOptions = buildRequest(ASTROMETRY_SUBISSIONS_URL(submissionID));

    return WebRequest(submissionOptions, '').then(results => {
        if (results.jobs && results.jobs.length > 0) {
            // processing started
            if (results.job_calibrations && results.job_calibrations.length > 0) {
                // processing completed
                return {
                    'status': ASTROMETRY_SUBMISSION_COMPLETED,
                    ...results
                };
            }
            return {
                'status': ASTROMETRY_SUBMISSION_STARTED,
                ...results
            };
        }
        return {
            'status': ASTROMETRY_SUBMISSION_PENDING,
            ...results
        };;
    });

};

export const jobStatus = (jobId) => {

    const jobOptions = buildRequest(ASTROMETRY_JOBS_URL(jobId));

    return WebRequest(jobOptions, '').then(status => {
        console.log(status);
    });
};