import {
    stopPreview,
    getParamValue
} from '/js/libs/formUtils.js';

import {
    MJPEGPlayer //,
    //MJPEGStream
} from '/js/mjpeg/index.js';

window.addEventListener('DOMContentLoaded', async () => {
    
    if (window.histogramCanvasRef) {
        const height = window.histogramCanvasRef.height;
        const width = window.histogramCanvasRef.width;
        const canvasHeight = height-10;
        window.histogramCanvasRef.rectangle(0, 0, width, height, {
            color: 'black',
            fillStrokeClear: 'fill'
        });
    }
    
    const canvasObj = document.getElementById('player');
    if (!getParamValue('canvas')) {
        //not a canvas to do iframe impl
        if (canvasObj) {
            canvasObj.style.display = 'none';
        }
        const iframe = document.createElement('iframe');
        iframe.width = 640;
        iframe.height = 480;
        iframe.id = 'videoDisplay';
        iframe.src = `/preview?x-uuid=${window.xUuid}`;
        const parent = canvasObj.parentElement;
        parent.prepend(iframe);
        parent.prepend(canvasObj);
        return;
    }
    canvasObj.style.display = 'block';
    if (canvasObj.style.display !== 'block') {
        return;
    }

    const options = {
        errorHandler: async (err) => {
            console.log(err);
            //streamPlayer.stream = new MJPEGStream(streamPlayer.options);
            //streamPlayer.start();
        },
        refreshRate: 250,
        onStop: stopPreview
    };
    const streamPlayer = new MJPEGPlayer('player', `/preview?x-uuid=${window.xUuid}`, options);
    streamPlayer.start();
    window.streamPlayer = streamPlayer;
});
