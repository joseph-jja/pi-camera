window.addEventListener('DOMContentLoaded', () => {

    const currentHost = window.location.origin;
    const defaultParams = window.location.search;
    if (defaultParams && defaultParams.length > 0) {
        const iframe = document.getElementById('videoDisplay');
        iframe.src = `/preview?previewOpts=${defaultParams.replace('?', '')}`;
    }

    function setBitrate(formElements) {
        const videoSize = formElements.filter(item => {
            return (item.name === 'videoSize');
        })[0];
        const frameRate = formElements.filter(item => {
            return (item.name === 'framerate');
        })[0];
        if (videoSize.selectedOptions[0].value !== '' && frameRate.selectedOptions[0].value !== '') {
            const videoOption = videoSize.selectedOptions[0].value.split(' '),
                framerateOption = frameRate.selectedOptions[0].value.split(' ');
            const [width, height] = videoOption.filter(item => {
                return parseInt(item);
            });
            const [rate] = framerateOption.filter(item => {
                return parseInt(item);
            });
            const bitrate = width * height * rate;
            return `--bitrate ${bitrate < 25000000 ? bitrate : 25000000}`;
        }
        return '';
    }

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button' && target.id === 'executeButton') {
            const formElements = Array.from(document.forms['cameraOptions']);
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
            const bitrate = setBitrate(formElements);
            console.log(bitrate);
            if (options.trim().length > 0) {
                fetch('/update', {
                    method: 'POST',
                    cache: 'no-cache',
                    referrerPolicy: 'no-referrer',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: options
                }).then(() => {
                    const iframe = document.getElementById('videoDisplay');
                    iframe.src = `/preview?previewOpts=${options}`;
                    const historyPath = `${currentHost}?params=${escape(options)}`;
                    window.history.pushState(escape(options), 'PI Camera', historyPath);
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
