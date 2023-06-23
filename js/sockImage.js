import {
    io
} from "/js/socket.io.esm.min.js";

const socketInfo = document.getElementById('server-info');
const serverErrors = document.getElementById('server-messages');
const plateSolveStatue = document.getElementById('previewOptions');

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
    } catch(_e) {
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
    if (status === plateSolveError) {
        serverErrors.innerHTML = stringify(message);
    } else {
        plateSolveStatue.innerHTML = stringify(message);;
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
