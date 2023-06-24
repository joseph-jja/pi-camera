import {
    writeFile,
    readFile
} from 'fs/promises';

import {
    login
} from '#libs/astrometry/login.mjs';

import {
    upload
} from '#libs/astrometry/fileupload.mjs';

import {
    submissionStatus,
    jobStatus,
    jobInfo
} from '#libs/astrometry/status.mjs';

import {
    resolve,
    basename
} from 'path';

const filename = basename(resolve(
    import.meta.url));

import {
    createRequire
} from "module";
const require = createRequire(
    import.meta.url);

const basedir = process.cwd(),
    {
        OLD_FILENAME_MATCH
    } = require(`${basedir}/xhrActions/Constants`),
    {
        captureEmitter
    } = require(`${basedir}/libs/videoScripts`),
    {
        BASE_IMAGE_PATH,
        SOLVED_INFO_PATH
    } = require(`${basedir}/libs/videoScripts`),
    stringify = require(`${basedir}/libs/stringify`),
    promiseWrapper = require(`${basedir}/libs/PromiseWrapper`),
    logger = require(`${basedir}/libs/logger`)(filename);

const sendError = (err, response, statusCode = 500) => {
    response.writeHead(statusCode || 500, {});
    response.end(stringify(err));
    captureEmitter.emit('plate-solve', {
        status: 'plateSolveError',
        message: (err).toString()
    });
};

const verifyFilename = (filename, response) => {

    if (!filename) {
        response.writeHead(200, {});
        response.end('Missing parameters, nothing done!');
        logger.info('Missing parameters, nothing done!');
        return false;
    }

    const filteredOldFilename = filename.match(OLD_FILENAME_MATCH);
    if (!filteredOldFilename || !filename.endsWith('.png')) {
        response.writeHead(200, {});
        response.end('Invalid file name, nothing done!');
        logger.info('Invalid file name, nothing done!');
        return false;
    }
    return true;
}

const subIdFilename = filename => `${SOLVED_INFO_PATH}/${filename}.subid`;

export const uploadAstrometryFile = async (request, response, apiKey) => {

    if (!apiKey) {
        response.writeHead(401, {});
        response.end('Not authorized');
        logger.warn('Unauthorized access!');
        return;
    }

    const query = (request.query || {});
    const filename = query.name;
    if (!verifyFilename(filename, response)) {
        return;
    }

    const subIdName = subIdFilename(filename);

    const [_eErr, subId] = await promiseWrapper(readFile(subIdName));
    if (subId) {
        response.writeHead(200, {});
        response.end(stringify(subId));
        captureEmitter.emit('plate-solve', {
            status: 'plateSolvingInitiated',
            message: subId
        });
        return;
    }

    const [sErr, session] = await promiseWrapper(login(apiKey));
    if (session) {
        const [uErr, status] = await promiseWrapper(upload(session, `${BASE_IMAGE_PATH}/${filename}`));
        if (status) {
            response.writeHead(200, {});
            response.end(stringify(status));
            captureEmitter.emit('plate-solve', {
                status: 'plateSolvingInitiated',
                message: status,
                filename: filename
            });
            // write file with sub id
            writeFile(subIdName, `{"submissionId": ${status}}`);
            return;
        }
        sendError(uErr, response);
    } else if (sErr) {
        sendError(sErr, response);
    } else {
        sendError('No session created!', response, 401);
    }
};

export const statusCheckAstrometry = async (request, response) => {

    const query = (request.query || {});
    const jobId = query.jobId,
        submissionId = query.submissionId;
    if (!jobId && !submissionId) {
        sendError('No id to check!', response, 200);
        return;
    }

    const filename = query.name;
    if (!verifyFilename(filename, response)) {
        return;
    }

    const subIdName = subIdFilename(filename);

    if (jobId) {
        // given a job id check to see if it is done 
        // if success then get all the info from the plate solve
        const [jErr, results] = await promiseWrapper(jobStatus(jobId));
        if (jErr) {
            sendError(jErr, response);
            return;
        }
        if (results && results.status && results.status.toLowerCase() === 'success') {
            // most of the job info 
            const [jiErr, iResults] = await promiseWrapper(jobInfo(jobId));
            if (jiErr) {
                sendError(jiErr, response);
                return;
            }
            response.writeHead(200, {});
            response.end(stringify(iResults));
            captureEmitter.emit('plate-solve', {
                status: 'plateSolvingJobCompleted',
                message: iResults
            });
            return;
        }
        response.writeHead(200, {});
        response.end(stringify(results));
        captureEmitter.emit('plate-solve', {
            status: 'plateSolvingJobStatus',
            message: results
        });
        return;
    } else if (submissionId) {
        const [uErr, results] = await promiseWrapper(submissionStatus(submissionId));
        if (uErr) {
            sendError(uErr, response);
            return;
        }
        response.writeHead(200, {});
        response.end(stringify(results));
        const submissionResults = Object.assign({}, results, {
            'submissionId': submissionId
        });
        writeFile(subIdName, stringify(submissionResults)).then(_res => {
                logger.info(`File updated ${subIdName}`);
            }).catch(_e => {
                logger.error(`File was not updated ${subIdName}`);
            })
            .finally(() => {
                captureEmitter.emit('plate-solve', {
                    status: 'plateSolvingSubmissionStatus',
                    message: results,
                    filename: filename
                });
            });
        return;
    }
    sendError('No idea how we got here :)', response);
};
