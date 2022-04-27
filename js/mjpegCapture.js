import {
    stopPreview,
    getParamValue
} from '/js/libs/formUtils.js';

import {
    MJPEGPlayer//,
    //MJPEGStream
} from '/js/mjpeg/index.js';

window.addEventListener('DOMContentLoaded', async () => {

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
        const parent = document.getElementById('center-aligner');
        parent.prepend(iframe);
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
