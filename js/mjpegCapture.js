import {
    stopPreview,
    getParamValue
} from '/js/libs/formUtils.js';

import {
    MJPEGPlayer//,
    //MJPEGStream
} from '/js/mjpeg/index.js';

window.addEventListener('DOMContentLoaded', async () => {
    let streamPlayer;

    if (!getParamValue('canvas')) {
        return;
    }

    const canvasObj = document.getElementById('player');
    if (!canvasObj) {
        return;
    }
    canvasObj.style.display = 'block';

    const uuid = (!xUuid) ? /* eslint-disable-line */
        await fetch('/config').then(async resp => {
            const headers = await resp.headers;
            const xuid = headers.get('x-uuid');
            return xuid;
        }) : xUuid;  /* eslint-disable-line */

    if (canvasObj.style.display === 'block') {
        const options = {
            errorHandler: async (err) => {
                console.log(err);
                //streamPlayer.stream = new MJPEGStream(streamPlayer.options);
                //streamPlayer.start();
            },
            refreshRate: 250,
            onStop: stopPreview
        };

        //Leave your .mjpeg video URL here.
        streamPlayer = new MJPEGPlayer('player', `/preview?x-uuid=${uuid}`, options);
        streamPlayer.start();
        window.streamPlayer = streamPlayer;
    }
});
