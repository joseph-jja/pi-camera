window.addEventListener('DOMContentLoaded', () => {

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
                return `${acc} ${next}`;
            });
            if (options.trim().length > 0) {
                fetch('/update', {
                    method: 'POST',
                    cache: 'no-cache',
                    referrerPolicy: 'no-referrer',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: options
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
