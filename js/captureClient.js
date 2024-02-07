/* eslint max-statements: 0 */
import * as formUtils from '/js/libs/formUtils.js';

const {
    listImageCaptures,
    shutdown,
    executeGETRequest,
    stopPreview,
    startPreview,
    videoUpdate,
    displayImages,
    updateImage
} = formUtils;

function safelyParse(jsonIn) {
    try {
        return JSON.parse(jsonIn);
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

function findAndSetOption(selectObj, value) {
    if (selectObj && value) {
        const selectOpts = selectObj.options;
        if (selectOpts && typeof selectOpts !== 'string') {
            const index = Array.from(selectOpts).findIndex(item => {
                return (value === item.value);
            });
            if (index > 0) {
                selectObj.selectedIndex = index;
            }
        }
    }
}

function restore() {

    const processForm = (formName) => {
        const formData = localStorage.getItem(formName);
        if (!formData) {
            return;
        }
        const data = safelyParse(formData);
        if (!data || !Array.isArray(data)) {
            return;
        }
        const formObj = document.forms[formName];
        data.forEach(item => {
            const keys = Object.keys(item);
            if (keys && keys.length > 0) {
                const key = keys[0];
                const value = item[key];
                const selectObj = formObj[key];
                findAndSetOption(selectObj, value);
            }
        });
    };

    processForm('videoOptions');
    processForm('imageOptions');
}

function profileUpdate() {
    const mainForm = document.forms['mainForm'];
    if (!mainForm && !mainForm.profiles && !mainForm.profiles.selectedOptions) {
        return;
    }
    const selected = mainForm.profiles.selectedOptions[0].value;
    if (selected.length > 0) {
        const options = safelyParse(decodeURIComponent(selected));
        if (!options) {
            return;
        }
        Object.keys(options).forEach(key => {
            const opts = options[key];
            const form = document.forms[key];
            if (opts && Array.isArray(opts) && form) {
                opts.forEach(field => {
                    const selectObj = form[field.name];
                    const value = field.value;
                    findAndSetOption(selectObj, value);
                });
            }
        });
        updateImage().catch().finally(() => {
            videoUpdate();
        });
    }
}

function usePlayer(playerMethod, altHandler) {
    if (typeof window.streamPlayer !== 'undefined') {
        window.streamPlayer[playerMethod]();
        if (playerMethod === 'stop') {
            altHandler();
        }
    } else {
        altHandler();
    }
}

function getSelectedImage(mainForm) {
    const imageList = mainForm['image_list'];
    if (!imageList || imageList.seectedOptions === 0) {
        return;
    }
    return imageList.selectedOptions[0].value.trim();
}

window.addEventListener('DOMContentLoaded', () => {

    const mainForm = document.forms['mainForm'];
    listImageCaptures();
    restore();

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!target) {
            return;
        }
        const name = target.nodeName;
        if (name.toLowerCase() !== 'button') {
            return;
        }
        if (target.id === 'updateButton') {
            videoUpdate();
        } else if (target.id === 'useProfile') {
            profileUpdate();
        } else if (target.id === 'startPreview') {
            usePlayer('start', startPreview);
        } else if (target.id === 'stopPreview') {
            usePlayer('stop', stopPreview);
        } else if (target.id === 'imageUpdate') {
            updateImage();
        } else if (target.id === 'renameFile') {
            const VALID_CHARACTERS = /[a-zA-Z]/g;
            const currentItem = getSelectedImage(mainForm);
            const fname = (mainForm['new-name'].value || '').match(VALID_CHARACTERS).join('');
            executeGETRequest(`/renameFile?oldname=${currentItem}&name=${fname}`).then(listImageCaptures);
        } else if (target.id === 'deleteFile') {
            const currentItem = getSelectedImage(mainForm);
            executeGETRequest(`/deleteFile?name=${currentItem}`).then(listImageCaptures);
        } else if (target.id === 'plateSolveImage') {
            const currentItem = getSelectedImage(mainForm);
            const isImage = currentItem.endsWith('.jpg') || currentItem.endsWith('.png');
            if (isImage) {
                // have image so make request to plate solve
                executeGETRequest(`/uploadAstrometryFile?name=${currentItem}`);
            }
        } else if (target.id === 'viewImageOrVideo') {
            const currentItem = getSelectedImage(mainForm);
            const isImage = currentItem.endsWith('.jpg') || currentItem.endsWith('.png');
            displayImages(`/viewImageOrVideo?name=${currentItem}`, isImage);
        } else if (target.id === 'imageCapture') {
            const filename = document.forms['saveImages'].imageCaptureName.value.trim();
            const saveFilename = (filename && filename.length > 0 ? `&saveFilename=${filename}` : '');
            const imageCount = document.forms['saveImages'].imagecount.selectedOptions[0].value.trim();
            const previewVideo = document.forms['videoRecord'].previewVideo.selectedOptions[0].value.trim();
            executeGETRequest(`/saveImage?imagecount=${imageCount}&preview=${previewVideo}${saveFilename}`).then(listImageCaptures);
        } else if (target.id === 'saveStream') {
            const videoLength = document.forms['videoRecord'].recordingTime.selectedOptions[0].value.trim();
            const codec = document.forms['videoRecord'].recordingCodec.selectedOptions[0].value.trim();
            const previewVideo = document.forms['videoRecord'].previewVideo.selectedOptions[0].value.trim();
            executeGETRequest(`/saveStream?recordingTime=${videoLength}&codec=${encodeURIComponent(codec)}&preview=${previewVideo}`).then(listImageCaptures);
        } else if (target.id === 'convertImages') {
            executeGETRequest('/convertFiles').then(listImageCaptures);
        } else if (target.id === 'listCaptures') {
            listImageCaptures();
        } else if (target.id === 'shutdownButton') {
            shutdown();
        }
    });
});
