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

function setMessage(msg) {
    const serverMsg = document.getElementById('server-messages');
    serverMsg.innerHTML = msg;
}
//    const msg = await resp.text();

export async function executeGETRequest(url) {
    fetch(url, {
        method: 'GET'
    }).then(async resp => {
        const message = await resp.text();
        setMessage(message);
        return Promise.resolve(message);
    }).catch(e => {
        return Promise.reject(e);
    });
}

export async function getConfig() {
    const saveOptionsObj = document.getElementById('previewOptions');
    executeGETRequest('/config').then(data => {
        if (data) {
            saveOptionsObj.innerHTML = data;
        }
        return Promise.resolve(data);
    }).catch(e => {
        console.log(e);
        saveOptionsObj.innerHTML = 'Error: ' + e;
        return Promise.reject(e);
    });
}

export async function listImageCaptures() {
    executeGETRequest('/imageList').then(images => {
        const container = document.getElementById('image-files');
        if (images){
            container.innerHTML = images;
        }
        return Promise.resolve(images);
    }).catch(e => {
        console.log(e);
        return Promise.reject(e);
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

export async function stopPreview() {
    const iframe = document.getElementById('videoDisplay');
    if (iframe) {
        iframe.src = '';
    }
    executeGETRequest(`/stopPreview?x-uuid=${xUuid}`).then(data => {  /* eslint-disable-line */
        return Promise.resolve(data);
    }).catch(e => {
        return Promise.reject(e);
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
        const msg = await resp.text();
        setMessage(msg);
        listImageCaptures();
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
        const msg = await resp.text();
        setMessage(msg);
        listImageCaptures();
        getConfig();
        Promise.resolve(msg);
    }).catch(e => {
        console.log(e);
        Promise.reject(e);
    });
}
