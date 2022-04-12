import {
    stopPreview
} from '/js/libs/formUtils.js';

import {
    MJPEGPlayer,
    MJPEGStream
} from '/js/mjpeg/index.js';

window.addEventListener('DOMContentLoaded', () => {
    let player;
    window.player = player;

    const canvasObj = document.getElementById('player');
    if (!canvasObj) {
        return;
    }

    fetch('/config').then(async resp => {
        const headers = await resp.headers;
        const xUuid = headers.get('x-uuid');

        const options = {
            errorHandler: (err) => {
                console.log(err);
                player.stream = new MJPEGStream(player.options);
                player.start();
            },
            refreshRate: 250,
            onStop: stopPreview
        };

        //Leave your .mjpeg video URL here.
        player = new MJPEGPlayer('player', `/preview?x-uuid=${xUuid}`, options);
        player.start();
    });
});
