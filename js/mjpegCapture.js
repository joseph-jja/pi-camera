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
    if (!getParamValue('canvas') || !canvasObj) {
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
