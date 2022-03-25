window.addEventListener('DOMContentLoaded', () => {

    /*function setBitrate(formElements) {
        const videoSize = formElements.filter(item => {
            return (item.name === 'videoSize');
        })[0];
        if (videoSize && videoSize.selectedOptions && videoSize.selectedOptions[0].value !== '') {
            const videoOption = videoSize.selectedOptions[0].value.split(' ');
            const [width, height] = videoOption.filter(item => {
                return parseInt(item);
            });
            const wxh = width * height;
            let bitrate = 15000000;
            if (wxh === 307200 || wxh === 480000) {
                // 640 x 480
                bitrate = 15000000;
            } else if (wxh === 921600) {
                // 1280 x 720
                bitrate = 10000000;
            } else {
                // everything else
                bitrate = 5000000;
            }
            return `--bitrate ${bitrate}`;
        }
        return '';
    }*/

    const formObj = document.forms['cameraOptions'];
    const serverMsg = document.getElementById('server-messages');
    let intervalTimer;

    function getImageCaptureType() {
        const formElements = Array.from(formObj);

        const checkboxes = formElements.filter(element => {
            const nodeName = element.nodeName.toLowerCase(),
                nodeType = element.type.toLowerCase();
            return (nodeName === 'input' && nodeType === 'checkbox');
        });

        const isImageCapture = checkboxes.filter(item => item.name === 'Image_Capture')[0];
        return (isImageCapture && isImageCapture.checked) ? 'image' : 'stream';
    }

    function getFormOptions() {

        const formElements = Array.from(formObj);
        //const bitrate = setBitrate(formElements);

        const imageCaptureType = getImageCaptureType();

        const options = formElements.filter(element => {
            const nodeName = element.nodeName.toLowerCase();
            return (nodeName !== 'button' && nodeName !== 'input');
        }).map(element => {
            const tagName = element.tagName.toLowerCase();
            if (tagName === 'select') {
                if (imageCaptureType === 'stream' && element.name === 'quality') {
                    return '';
                }
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
        const saveOptionsObj = formObj.previewOptions;
        fetch('/config').then(resp => {
            resp.text().then(data => {
                saveOptionsObj.value = data;
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

    function saveRawDataStream(url) {
        const imageCaptureType = getImageCaptureType();
        if (imageCaptureType === 'image') {
            serverMsg.innerHTML = 'Uncheck Image_Capture to save data.';
            return;
        }
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
        const options = getFormOptions();
        const iframe = document.getElementById('videoDisplay');
        fetch('/startPreview', {
            method: 'POST',
            cache: 'no-cache',
            referrerPolicy: 'no-referrer',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        }).then(resp => {
            setMessage(resp);
            getConfig();
            iframe.src = `/preview`;
        }).catch(e => {
            console.log(e);
        });
    }

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button' && target.id === 'updateButton') {
            const imageCaptureType = getImageCaptureType();
            if (imageCaptureType === 'image') {
                serverMsg.innerHTML = 'Uncheck Image_Capture to update options.';
                return;
            }
            const options = getFormOptions();
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
            const imageCaptureType = getImageCaptureType();
            if (imageCaptureType === 'image') {
                serverMsg.innerHTML = 'Uncheck Image_Capture to start preview.';
                return;
            }
            runPreview();
            intervalTimer = setInterval(() => {
                runPreview();
            }, 30000);
        } else if (name.toLowerCase() === 'button' && target.id === 'stopPreview') {
            fetch('/stopPreview', {
                method: 'GET'
            }).then(resp => {
                setMessage(resp);
            }).catch(e => {
                console.log(e);
            });
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
