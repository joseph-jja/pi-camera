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
        return `${acc} ${next}`.trim();
    });
    return options;
}

export async function setMessage(resp) {
    const serverMsg = document.getElementById('server-messages');
    const msg = await resp.text();
    serverMsg.innerHTML = msg;
}

export function getConfig() {
    const saveOptionsObj = document.getElementById('previewOptions');
    fetch('/config').then(resp => {
        resp.text().then(data => {
            saveOptionsObj.innerHTML = data;
        }).catch(e => {
            console.log(e);
            saveOptionsObj.innerHTML = 'Error: ' + e;
        });
    }).catch(e => {
        console.log(e);
        saveOptionsObj.innerHTML = 'Error: ' + e;
    });
}

export function listImageCaptures() {
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
