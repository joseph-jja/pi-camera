import bitrate from '/js/libs/bitrate.js';
import * as formUtils from '/js/libs/formUtils.js';

const {
    getFormOptions,
    setMessage,
    getConfig,
    listImageCaptures,
    shutdown
} = formUtils;

window.addEventListener('DOMContentLoaded', () => {

    const videoFormObj = document.forms['videoOptions'];
    const imageFormObj = document.forms['imageOptions'];

    listImageCaptures();

    function executeServerCommand(url) {
        getConfig();
        fetch(url, {
            method: 'GET'
        }).then(resp => {
            setMessage(resp);
            listImageCaptures();
        }).catch(e => {
            console.log(e);
        });
    }

    function runPreview() {
        const iframe = document.getElementById('videoDisplay');
        setTimeout(() => {
            iframe.src = '/preview';
        }, 100);
    }

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button' && target.id === 'updateButton') {
            const options = getFormOptions(videoFormObj);
            fetch('/update', {
                method: 'POST',
                cache: 'no-cache',
                referrerPolicy: 'no-referrer',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: options
            }).then(async resp => {
                setMessage(resp);
                getConfig();
            }).catch(e => {
                console.log(e);
            });
        } else if (name.toLowerCase() === 'button' && target.id === 'startPreview') {
            runPreview();
        } else if (name.toLowerCase() === 'button' && target.id === 'stopPreview') {
            const iframe = document.getElementById('videoDisplay');
            iframe.src = '';
            fetch('/stopPreview', {
                method: 'GET'
            }).then(resp => {
                setMessage(resp);
            }).catch(e => {
                console.log(e);
            });
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
