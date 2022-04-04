import * as formUtils from '/js/libs/formUtils.js';

const {
    getFormOptions,
    setMessage,
    listImageCaptures,
    shutdown,
    executeServerCommand,
    stopPreview,
    startPreview,
    videoUpdate
} = formUtils;

window.addEventListener('DOMContentLoaded', () => {

    const imageFormObj = document.forms['imageOptions'];
    listImageCaptures();

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button' && target.id === 'updateButton') {
            videoUpdate();
        } else if (name.toLowerCase() === 'button' && target.id === 'startPreview') {
            startPreview();
        } else if (name.toLowerCase() === 'button' && target.id === 'stopPreview') {
            stopPreview();
        } else if (name.toLowerCase() === 'button' && target.id === 'imageUpdate') {
            const options = getFormOptions(imageFormObj);
            fetch('/imageUpdate', {
                method: 'POST',
                cache: 'no-cache',
                referrerPolicy: 'no-referrer',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: options
            }).then(async resp => {
                setMessage(resp);
            }).catch(e => {
                console.log(e);
            });
        } else if (name.toLowerCase() === 'button' && target.id === 'imageCapture') {
            executeServerCommand('/saveImage');
        } else if (name.toLowerCase() === 'button' && target.id === 'saveStream') {
            executeServerCommand('/saveStream');
        } else if (name.toLowerCase() === 'button' && target.id === 'saveRawStream') {
            executeServerCommand('/saveRawStream');
        } else if (name.toLowerCase() === 'button' && target.id === 'listCaptures') {
            listImageCaptures();
        } else if (name.toLowerCase() === 'button' && target.id === 'shutdownButton') {
            shutdown();
        }
    });
});
