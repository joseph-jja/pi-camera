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

socket.on('plate-solve', (data) => {
    const {
        status,
        message
    } = data;
    // status can be
    // plateSolveError
    // plateSolvingInitiated
    // plateSolvingJobStatus
    // plateSolvingJobCompleted
    // plateSolvingSubmissionStatus
    let intervalId;
    if (status === 'plateSolveError') {
        serverErrors.innerHTML = stringify(message);
        if (intervalId) {
            clearInterval(intervalId);
        }
    } else if (status === 'plateSolvingSubmissionStatus') {
        // ignore this as we are polling 
    } else if (status === 'plateSolvingInitiated') {
        // we have submit id
        const submissionId = message;
        let tries = 0;

        intervalId = setInterval(() => {
            checkAstrometrySubmissionStatus('submissionId', submissionId).then(results => {
                const {
                    jobs,
                    hasJobs,
                    hasCalibrations,
                    hasErrors
                } = results;

                if (hasErrors) {
                    plateSolveStatus = 'An error occured while processing!'
                    console.error(hasErrors);
                    clearInterval(intervalId);
                } else if (hasCalibrations) {
                    plateSolveStatus = 'Processing has completed!';
                    const jobId = jobs[0];
                    clearInterval(intervalId);
                    checkAstrometrySubmissionStatus('jobId', jobId).then(results => {
                        // this is the full job results
                        const info = stringify(results);
                        plateSolveStatus = info;
                    }).catch(err => {
                        plateSolveStatus = stringify(err);
                    });
                } else if (hasJobs) {
                    plateSolveStatus = 'Processing has started!';
                    jobId = results.jobs[0];
                } else {
                    plateSolveStatus = 'Processing has NOT started!';
                }
                tries++;
                if (tries > 10) {
                    // at 30 second intervals the 10 tries makes 5 minutes
                    // so after 10 minutes give up
                    clearInterval(intervalId);
                }
            }).catch(err => {
                plateSolveStatus = stringify(err);
                clearInterval(intervalId);
            });
        }, 30000); // 30 seconds
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
