window.addEventListener('DOMContentLoaded', () => {

    function setBitrate(formElements) {
        const videoSize = formElements.filter(item => {
            return (item.name === 'videoSize');
        })[0];
        if (videoSize.selectedOptions[0].value !== '') {
            const videoOption = videoSize.selectedOptions[0].value.split(' ');
            const [width, height] = videoOption.filter(item => {
                return parseInt(item);
            });
            const wxh = width * height;
            let bitrate = 15000000;
            if (wxh === 307200) {
                bitrate = 10000000;
            } else if (wxh === 921600) {
                bitrate = 10000000;
            } else {
                bitrate = 15000000;
            }
            return `--bitrate ${bitrate}`;
        }
        return '';
    }

    function getFormOptions() {

        const formElements = Array.from(document.forms['cameraOptions']);
        const bitrate = setBitrate(formElements);
        const options = formElements.filter(element => {
            const nodeName = element.nodeName.toLowerCase();
            return (nodeName !== 'button');
        }).map(element => {
            const tagName = element.tagName.toLowerCase();
            if (tagName === 'select') {
                return element.selectedOptions[0].value;
            } else {
                return element.value;
            }
        }).reduce((acc, next) => {
            return `${acc} ${next}`.trim();
        });
        return `${options} ${bitrate}`;
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
            if (options.trim().length > 0) {
                fetch('/update', {
                    method: 'POST',
                    cache: 'no-cache',
                    referrerPolicy: 'no-referrer',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: options
                }).then(resp => {
                    setMessage(resp);
                });
            }
        } else if (name.toLowerCase() === 'button' && target.id === 'startPreview') {
            const options = getFormOptions();
            const iframe = document.getElementById('videoDisplay');
            iframe.src = `/preview?previewOpts=${options}`;
            const historyPath = `${window.location.href}?params=${escape(options)}`;
            window.history.pushState(escape(options), 'PI Camera', historyPath);
        } else if (name.toLowerCase() === 'button' && target.id === 'stopPreview') {
            fetch('/stopPreview', {
                method: 'GET'
            }).then(resp => {
                setMessage(resp);
            });
        } else if (name.toLowerCase() === 'button' && target.id === 'saveStream') {
            const options = getFormOptions();
            if (options.trim().length > 0) {
                fetch(`/saveStream?saveOpts=${options}`, {
                    method: 'GET'
                }).then(resp => {
                    setMessage(resp);
                });
            }
        } else if (name.toLowerCase() === 'button' && target.id === 'shutdownButton') {
            fetch('/shutdown', {
                method: 'POST',
                cache: 'no-cache',
                referrerPolicy: 'no-referrer',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: ''
            });
        }
    });
});
