import {
    stopPreview,
    videoUpdate
} from '/js/libs/formUtils.js';

import {
    MJPEGPlayer,
    MJPEGStream
} from '/js/mjpeg/index.js';

window.addEventListener('DOMContentLoaded', () => {
    let streamPlayer;

    const queryString = window.location.search;
    const params = (queryString && queryString.length > 1) ?
        new URLSearchParams(queryString.substring(1)) :
        undefined;

    if (!params || !params.get('canvas')) {
        return;
    }

    const canvasObj = document.getElementById('player');
    if (!canvasObj) {
        return;
    }
    canvasObj.style.display = 'block';

    fetch('/config').then(async resp => {
        const headers = await resp.headers;
        const xUuid = headers.get('x-uuid');

        if (canvasObj.style.display === 'block') {
            const options = {
                errorHandler: async (err) => {
                    console.log(err);
                    streamPlayer.stream = new MJPEGStream(streamPlayer.options);
                    await videoUpdate();
                    streamPlayer.start();
                },
                refreshRate: 250,
                onStop: stopPreview
            };

            //Leave your .mjpeg video URL here.
            streamPlayer = new MJPEGPlayer('player', `/preview?x-uuid=${xUuid}`, options);
            streamPlayer.start();
            window.streamPlayer = streamPlayer;
        }
    });
});
