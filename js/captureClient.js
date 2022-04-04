import bitrate from '/js/libs/bitrate.js';

window.addEventListener('DOMContentLoaded', () => {

    const videoFormObj = document.forms['videoOptions'];
    const imageFormObj = document.forms['imageOptions'];
    const serverMsg = document.getElementById('server-messages');

    function getFormOptions(formObj) {

        const formElements = Array.from(formObj);
        //const bitrate = setBitrate(formElements);

        const options = formElements.filter(element => {
            const nodeName = element.nodeName.toLowerCase();
            return (nodeName !== 'button' && nodeName !== 'input');
        }).map(element => {
            const tagName = element.tagName.toLowerCase();
            if (tagName === 'select') {
                return element.selectedOptions[0].value;
            } else {
                return '';
            }
        }).reduce((acc, next) => {
            return `${acc} ${next}`.trim();
        });
        return options; //`${options} ${bitrate}`;
    }

    async function setMessage(resp) {
        const msg = await resp.text();
        serverMsg.innerHTML = msg;
    }

    function getConfig() {
        const saveOptionsObj = document.getElementById('previewOptions');
        fetch('/config').then(resp => {
            resp.text().then(data => {
                saveOptionsObj.innerHTML = data;
            }).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            console.log(e);
        });
    }

    function listImageCaptures() {
        fetch('/imageList', {
            method: 'GET'
        }).then(async resp => {
            const images = await resp.text();
            const container = document.getElementById('image-files');
            container.innerHTML = images;
        }).catch(e => {
            console.log(e);
        });
    }
    listImageCaptures();

    function saveRawDataStream(url) {
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
            saveRawDataStream('/saveImage');
        } else if (name.toLowerCase() === 'button' && target.id === 'saveStream') {
            saveRawDataStream('/saveStream');
        } else if (name.toLowerCase() === 'button' && target.id === 'saveRawStream') {
            saveRawDataStream('/saveRawStream');
        } else if (name.toLowerCase() === 'button' && target.id === 'listCaptures') {
            listImageCaptures();
        } else if (name.toLowerCase() === 'button' && target.id === 'shutdownButton') {
            fetch('/shutdown', {
                method: 'POST',
                cache: 'no-cache',
                referrerPolicy: 'no-referrer',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: ''
            }).catch(e => {
                console.log(e);
            });
        }
    });
});
