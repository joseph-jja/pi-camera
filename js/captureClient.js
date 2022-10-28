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

function restore() {

    const processForm = (formName) => {
        const formData = localStorage.getItem(formName);
        if (!formData) {
            return;
        }
        const data = JSON.parse(formData);
        const formObj = document.forms[formName];
        data.forEach(item => {
            const key = Object.keys(item)[0];
            const value = item[key];
            const selectObj = formObj[key];
            if (selectObj) {
                const selectOpts = selectObj.options;
                const index = Array.from(selectOpts).findIndex(item => {
                    return (value === item.value);
                });
                if (index > 0) {
                    selectObj.selectedIndex = index;
                }
            }
        });
    };

    processForm('videoOptions');
    processForm('imageOptions');
}

function profileUpdate() {
    const mainForm = document.forms['mainForm'];
    const selected = mainForm.profiles.selectedOptions[0].value;
    if (selected.length > 0) {
        const options = JSON.parse(decodeURIComponent(selected));
        Object.keys(options).forEach(key => {
            const opts = options[key];
            const form = document.forms[key];
            opts.forEach(field => {
                const selectObj = form[field.name];
                if (selectObj) {
                    const selectOpts = selectObj.options;
                    const index = Array.from(selectOpts).findIndex(item => {
                        return (field.value === item.value);
                    });
                    if (index > 0) {
                        selectObj.selectedIndex = index;
                    }
                }
            });
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

window.addEventListener('DOMContentLoaded', () => {

    const mainForm = document.forms['mainForm'];
    listImageCaptures();
    restore();

    document.addEventListener('click', (event) => {
        const target = event.target;
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
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            const fname = (mainForm['new-name'].value || '').match(VALID_CHARACTERS).join('');
            executeGETRequest(`/renameFile?oldname=${currentItem}&name=${fname}`).then(listImageCaptures);
        } else if (target.id === 'deleteFile') {
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            executeGETRequest(`/deleteFile?name=${currentItem}`).then(listImageCaptures);
        } else if (target.id === 'viewImageOrVideo') {
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            const isImage = currentItem.endsWith('.jpg');
            displayImages(`/viewImageOrVideo?name=${currentItem}`, isImage);
        } else if (target.id === 'imageCapture') {
            const imageCount = document.forms['saveImages'].imagecount.selectedOptions[0].value.trim();
            executeGETRequest(`/saveImage?imagecount=${imageCount}`).then(listImageCaptures);
        } else if (target.id === 'saveMJPEGStream') {
            const videoLength = document.forms['videoRecord'].recordingTime.selectedOptions[0].value.trim();
            executeGETRequest(`/saveMJPEGStream?recordingTime=${videoLength}`).then(listImageCaptures);
        } else if (target.id === 'saveYUV420Stream') {
            const videoLength = document.forms['videoRecord'].recordingTime.selectedOptions[0].value.trim();
            executeGETRequest(`/saveYUV420Stream?recordingTime=${videoLength}`).then(listImageCaptures);
        } else if (target.id === 'saveH264Stream') {
            const videoLength = document.forms['videoRecord'].recordingTime.selectedOptions[0].value.trim();
            executeGETRequest(`/saveH264Stream?recordingTime=${videoLength}`).then(listImageCaptures);
        } else if (target.id === 'saveRawStream') {
            const videoLength = document.forms['videoRecord'].recordingTime.selectedOptions[0].value.trim();
            executeGETRequest(`/saveRawStream?recordingTime=${videoLength}`).then(listImageCaptures);
        } else if (target.id === 'listCaptures') {
            listImageCaptures();
        } else if (target.id === 'shutdownButton') {
            shutdown();
        }
    });
});
