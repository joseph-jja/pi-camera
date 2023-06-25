import {
    io
} from "/js/socket.io.esm.min.js";

import {
    checkAstrometrySubmissionStatus
} from '/js/libs/formUtils.js';


const socketInfo = document.getElementById('server-info');
const serverErrors = document.getElementById('server-messages');
const plateSolveStatus = document.getElementById('previewOptions');

const socket = io();
socket.on('connect', () => {
    console.log('Socket connected ', socket.id);
    setInterval(() => {
        // ping
        socket.emit('status', {});
    }, 5000);
});
socket.on('info', (data) => {
    //console.log('Got data ', data);
    const keys = Object.keys(data);
    const results = keys.map(key => {
        return `${key}: ${JSON.stringify(data[key])}`;
    }).reduce((acc, next) => {
        return `${acc} <br> ${next}`;
    });
    socketInfo.innerHTML = results;
});

const stringify = data => {
    try {
        return JSON.stringify(data);
    } catch (_e) {
        return data;
    }
}

// return codes
const PROCESSING_NOT_STARTED = 0;
const PROCESSING_STARTED = 1;
const PROCESSING_COMPLETED = 2;
const PROCESSING_ERROR = -1;

const processResponse = resp => {
    const {
        jobs,
        hasJobs,
        hasCalibrations,
        hasErrors
    } = results;

    if (hasErrors) {
        plateSolveStatus = 'An error occured while processing!'
        console.error(hasErrors);
        return {
            status: PROCESSING_ERROR
        };
    } else if (hasCalibrations) {
        plateSolveStatus = 'Processing has completed!';
        const jobId = jobs[0];
        return {
            status: PROCESSING_COMPLETED,
            jobId: jobId
        };
    } else if (hasJobs) {
        plateSolveStatus = 'Processing has started!';
        jobId = results.jobs[0];
        return {
            status: PROCESSING_STARTED
        };
    } else {
        plateSolveStatus = 'Processing has NOT started!';
        return {
            status: PROCESSING_NOT_STARTED
        };
    }
};

function safelyParse(data) {
    try {
        return JSON.parse(data);
    } catch(_e) {
        return data;
    }
}

let tries = 0;
let solveStatus;
socket.on('plate-solve', (data) => {
    const {
        status,
        message,
        filename
    } = data;
    const {
        subid,
        jobs
    } = safelyParse(message);
    // status can be
    // plateSolveError
    // plateSolvingInitiated
    // plateSolvingJobStatus
    // plateSolvingJobCompleted
    // plateSolvingSubmissionStatus
    if (status === 'plateSolveError') {
        serverErrors.innerHTML = stringify(message);
    } else if (status === 'plateSolvingSubmissionStatus' && tries < 10 && subid) {
        // tries more than 10 is 5 minutes
        tries += 1;

        // we have submit id and filename 
        const submissionId = subid;

        if (solveStatus.status === PROCESSING_ERROR) {
            return;
        }

        if (solveStatus.status === PROCESSING_COMPLETED) {
            if (jobs && Array.isArray(jobs) && jobs.length >0) {
                try {
                    setTimeout(async () => {
                        const resp = await checkAstrometrySubmissionStatus('jobId', jobs[0], filename);

                        plateSolveStatus = json.stringify(resp);
                    }, 5000);
                } catch (e) {
                    console.error(e);
                }
            }
            return;
        }

        try {
            setTimeout(async () => {
                const resp = await checkAstrometrySubmissionStatus('submissionId', submissionId, filename);

                solveStatus = processResponse(resp);

            }, 30000);
        } catch (e) {
            console.error(e);
        }

    } else if (status === 'plateSolvingInitiated' && subid) {
        tries = 1;
        // we have submit id and filename 
        const submissionId = subid;

        try {
            setTimeout(async () => {
                const resp = await checkAstrometrySubmissionStatus('submissionId', submissionId, filename);

                solveStatus = processResponse(resp);

            }, 30000);
        } catch (e) {
            console.error(e);
        }

    } else {
        plateSolveStatus.innerHTML = stringify(message);
    }
});

socket.on('histogram', (data) => {
    if (data.status.toLowerCase() === 'success') {
        const histoData = data.data;

        const height = window.histogramCanvasRef.height;
        const width = window.histogramCanvasRef.width;
        const canvasHeight = height - 10;
        window.histogramCanvasRef.rectangle(0, 0, width, height, {
            color: 'black',
            fillStrokeClear: 'fill'
        });
        let posx = 5;

        Object.keys(histoData).forEach(key => {

            const val = histoData[key]; // value

            const yStart = canvasHeight;
            const yEnd = canvasHeight - Math.ceil(val / canvasHeight);

            for (let i = 0; i < 2; i++) {
                window.histogramCanvasRef.line(posx, yStart, posx, yEnd, {
                    color: '#FF6347'
                });
                posx++;
            }

        });
    }
});
