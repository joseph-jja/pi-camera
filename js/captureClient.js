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
        console.log(videoSize);
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
            setBitrate(formElements);
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
