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

    function getFormOptions() {

        const formElements = Array.from(formObj);
        //const bitrate = setBitrate(formElements);
        const options = formElements.filter(element => {
            const nodeName = element.nodeName.toLowerCase();
            return (nodeName !== 'button');
        }).map(element => {
            const tagName = element.tagName.toLowerCase();
            if (tagName === 'select') {
                return element.selectedOptions[0].value;
            } else if (tagName !== 'input'){
                return element.value;
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
        const serverMsg = document.getElementById('server-messages');
        serverMsg.innerHTML = msg;
    }

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button' && target.id === 'updateButton') {
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
                await setMessage(resp);
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
            }).catch(e => {
                console.log(e);
            });
        } else if (name.toLowerCase() === 'button' && target.id === 'startPreview') {
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
                iframe.src = `/preview`;
            }).catch(e => {
                console.log(e);
            });
        } else if (name.toLowerCase() === 'button' && target.id === 'stopPreview') {
            fetch('/stopPreview', {
                method: 'GET'
            }).then(resp => {
                setMessage(resp);
            }).catch(e => {
                console.log(e);
            });
        } else if (name.toLowerCase() === 'button' && target.id === 'saveStream') {
            fetch('/saveStream', {
                method: 'GET'
            }).then(resp => {
                setMessage(resp);
            }).catch(e => {
                console.log(e);
            });
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
