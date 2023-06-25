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
    } = resp;

    if (hasErrors) {
        plateSolveStatus.innerHTML = 'An error occured while processing!'
        console.error(hasErrors);
        return {
            status: PROCESSING_ERROR
        };
    } else if (hasCalibrations) {
        plateSolveStatus.innerHTML = 'Processing has completed!';
        const jobId = jobs[0];
        return {
            status: PROCESSING_COMPLETED,
            jobId: jobId
        };
    } else if (hasJobs) {
        plateSolveStatus.innerHTML = 'Processing has started!';
        jobId = results.jobs[0];
        return {
            status: PROCESSING_STARTED
        };
    } else {
        plateSolveStatus.innerHTML = 'Processing has NOT started!';
        return {
            status: PROCESSING_NOT_STARTED
        };
    }
};

function x() {
    statusCheckAstrometry
}

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

    const msgData =  safelyParse(message);
    const {
        subid,
        jobs
    } = msgData;;
    // status can be
    // plateSolveError
    // plateSolvingInitiated
    // plateSolvingJobStatus
    // plateSolvingJobCompleted
    // plateSolvingSubmissionStatus
    if (status === 'plateSolveError') {
        serverErrors.innerHTML = stringify(msgData);
    } else if (status === 'plateSolvingInitiated' || status === 'plateSolvingSubmissionStatus') {

        if (tries > 10) {
            return;
        }

        if (status === 'plateSolvingInitiated') {
            tries = 1;
            solveStatus = undefined;
        } else {
            tries += 1;
        }
        // we have submit id and filename 
        const submissionId = parseInt(subid);

        try {
            setTimeout(async () => {
                const resp = await checkAstrometrySubmissionStatus('submissionId', submissionId, filename);

                solveStatus = processResponse(resp);
                if (solveStatus.status === PROCESSING_COMPLETED) {

                    const jobId = parseInt(solveStatus.jobId);
                    setTimeout(async () => {
                        const resp = await checkAstrometrySubmissionStatus('jobId', jobId, filename);

                        plateSolveStatus.innerHTML = json.stringify(resp);
                        tries = 100;
                    }, 2500);
                }

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
