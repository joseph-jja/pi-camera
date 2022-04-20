export function getFormOptions(formObj) {

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
        return `${acc}${next.startsWith('-') ? ' ': ''}${next}`.trim();
    });
    return options;
}

export async function setMessage(resp) {
    const serverMsg = document.getElementById('server-messages');
    const msg = await resp.text();
    serverMsg.innerHTML = msg;
}

export async function getConfig() {
    const saveOptionsObj = document.getElementById('previewOptions');
    fetch('/config').then(resp => {
        resp.text().then(data => {
            saveOptionsObj.innerHTML = data;
            Promise.resolve(data);
        }).catch(e => {
            console.log(e);
            saveOptionsObj.innerHTML = 'Error: ' + e;
            Promise.reject(e);
        });
    }).catch(e => {
        console.log(e);
        saveOptionsObj.innerHTML = 'Error: ' + e;
        Promise.reject(e);
    });
}

export async function listImageCaptures() {
    fetch('/imageList', {
        method: 'GET'
    }).then(resp => {
        resp.text().then(images => {
            const container = document.getElementById('image-files');
            container.innerHTML = images;
            Promise.resolve(images);
        }).catch(e => {
            console.log(e);
            Promise.reject(e);
        });
    }).catch(e => {
        console.log(e);
        Promise.reject(e);
    });
}

export function shutdown() {
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

export function displayImages(url, isImage) {
    if (isImage) {
        window.open(url);
        return;
    }
    const videoDisplay = document.getElementById('videoDisplay');
    videoDisplay.src = url;
}

export function executeServerCommand(url) {
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

export async function stopPreview() {
    const iframe = document.getElementById('videoDisplay');
    if (iframe) {
        iframe.src = '';
    }
    fetch(`/stopPreview?x-uuid=${xUuid}`, {  /* eslint-disable-line */
        method: 'GET'
    }).then(resp => {
        setMessage(resp);
        Promise.resolve();
    }).catch(e => {
        console.log(e);
        Promise.reject();
    });
}

export function startPreview() {
    const iframe = document.getElementById('videoDisplay');
    if (!iframe) {
        return;
    }
    iframe.src = `/preview?x-uuid=${xUuid}`; /* eslint-disable-line */
}

export function updateImage(imageFormObj) {
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
}

export async function videoUpdate() {
    await stopPreview();
    const videoFormObj = document.forms['videoOptions'];
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
        Promise.resolve();
    }).catch(e => {
        console.log(e);
        Promise.reject();
    });
}
