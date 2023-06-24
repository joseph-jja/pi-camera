export function getFormOptions(formObj) {

    const formElements = Array.from(formObj);
    if (!formElements || !Array.isArray(formElements)) {
        return [];
    }

    const filtered = formElements.filter(element => {
        if (!element || !element.nodeName) { 
            return false;
        }
        const nodeName = element.nodeName.toLowerCase();
        return (nodeName !== 'button' && nodeName !== 'input');
    });

    if (!filtered || !Array.isArray(filtered)) {
        return [];
    }

    const storageElements = filtered.filter(element => {
        if (!element || !element.tagName) { 
            return false;
        }
        const tagName = element.tagName.toLowerCase();
        return (tagName === 'select' && element.selectedOptions &&
            element.selectedOptions.length > 0 &&    
            element.selectedOptions[0].value &&
            element.selectedOptions[0].value.length > 0);
    });
    
    if (storageElements && storageElements.length > 0) {
    
        const storage = storageElements.map(element => {
            //const tagName = element.tagName.toLowerCase();
            return {
                [element.name]: `${element.selectedOptions[0].value}`
            };
        });
        if (storage) {
            localStorage.setItem(formObj.name, JSON.stringify(storage));
        }
    }
    
    const optionsMapped = filtered.map(element => {
        if (!element || !element.tagName) { 
            return false;
        }
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'select') {
            return element.selectedOptions[0].value;
        } else {
            return '';
        }
    });
    if (optionsMapped && optionsMapped.length > 0) {
        const options = optionsMapped.reduce((acc, next) => {
            return `${acc}${next.startsWith('-') ? ' ': ''}${next}`.trim();
        });
        return options;
    }
    return [];
}

export function getParams() {
    const queryString = (window && window.location ? window.location.search : undefined);
    return (queryString && queryString.length > 1) ?
        new URLSearchParams(queryString.substring(1)) :
        undefined;
}

export function getParamValue(paramName) {
    const params = getParams();
    return (params ? params.get(paramName) : undefined);
}

function setInnerHTML(obj, value) {
    if (obj) {
        obj.innerHTML = value;
    }
}

function setMessage(msg) {
    const serverMsg = document.getElementById('server-messages');
    setInnerHTML(serverMsg, msg);
}
//    const msg = await resp.text();

export async function executeGETRequest(url, skipMessage = false) {
    return fetch(url, {
        method: 'GET'
    }).then(async resp => {
        const message = await resp.text();
        if (!skipMessage) {
            setMessage(message);
        }
        return Promise.resolve(message);
    }).catch(e => {
        return Promise.reject(e);
    });
}

export async function getConfig() {
    const saveOptionsObj = document.getElementById('previewOptions');
    return executeGETRequest('/config').then(data => {
        if (data) {
            setInnerHTML(saveOptionsObj, data);
        }
        return Promise.resolve(data);
    }).catch(e => {
        console.log(e);
        setInnerHTML(saveOptionsObj, 'Error: ' + e);
        return Promise.reject(e);
    });
}

export async function listImageCaptures() {
    return executeGETRequest('/imageList', true).then(images => {
        const container = document.getElementById('image-files');
        if (images && images.indexOf('<select') > -1) {
            setInnerHTML(container, images);
        } else {
            setInnerHTML(container, '');
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
    if (videoDisplay) {
        videoDisplay.src = url;
    }
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

export async function updateImage() {
    const imageFormObj = document.forms['imageOptions'];
    const options = getFormOptions(imageFormObj);
    return fetch('/imageUpdate', {
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
        return Promise.resolve(msg);
    }).catch(e => {
        console.log(e);
        return Promise.reject(e);
    });
}

export async function videoUpdate() {
    await stopPreview();
    const videoFormObj = document.forms['videoOptions'];
    const options = getFormOptions(videoFormObj);
    return fetch('/update', {
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
        return Promise.resolve(msg);
    }).catch(e => {
        console.log(e);
        return Promise.reject(e);
    });
}

export async function checkAstrometrySubmissionStatus(type, typeId, filename) {
    return executeGETRequest(`/statusCheckAstrometry?${type}=${typeId}&name=${filename}`, true).then(resp => {
        try {
            const results = JSON.parse(resp);
            const jobs = results.jobs;
            const calibrations = results['job_calibrations'];

            const hasJobs = jobs && Array.isArray(jobs) && jobs.length > 0;
            const hasCalibrations = calibrations && Array.isArray(calibrations) && calibrations.length > 0;

            const hasErrors = results['error_message'];
            
            const data = {
                hasCalibrations,
                hasJobs,
                hasErrors,
                jobs,
                calibrations,
                ...results
            };
            if (hasErrors) {
                Promise.reject(data);
            } else {
                Promise.resolve(data);
            }
        } catch(_e) {
            return resp;
        }
    }).catch(e => {

    });
}
