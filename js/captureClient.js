import * as formUtils from '/js/libs/formUtils.js';

const {
    getFormOptions,
    setMessage,
    listImageCaptures,
    shutdown,
    executeServerCommand,
    stopPreview,
    startPreview,
    videoUpdate,
    displayImages
} = formUtils;

window.addEventListener('DOMContentLoaded', () => {

    const mainForm = document.forms['mainForm'];
    const imageFormObj = document.forms['imageOptions'];
    listImageCaptures();

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() !== 'button') {
            return;
        }
        if (target.id === 'updateButton') {
            videoUpdate();
        } else if (target.id === 'startPreview') {
            startPreview();
        } else if (target.id === 'stopPreview') {
            stopPreview();
        } else if (target.id === 'imageUpdate') {
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
        } else if (target.id === 'renameFile') {
            const VALID_CHARACTERS = /[a-zA-Z]/g;
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            const fname = (mainForm['new-name'].value || '').match(VALID_CHARACTERS)[0].join('');
            executeServerCommand(`/renameFile?oldname=${currentItem}&name=${fname}`);
        } else if (target.id === 'deleteFile') {
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            executeServerCommand(`/deleteFile?name=${currentItem}`);
        } else if (target.id === 'viewImageOrVideo') {
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            const isImage = currentItem.endsWith('.png');
            displayImages(`/viewImageOrVideo?name=${currentItem}`, isImage);
        } else if (target.id === 'imageCapture') {
            executeServerCommand('/saveImage');
        } else if (target.id === 'saveStream') {
            executeServerCommand('/saveStream');
        } else if (target.id === 'saveRawStream') {
            executeServerCommand('/saveRawStream');
        } else if (target.id === 'listCaptures') {
            listImageCaptures();
        } else if (target.id === 'shutdownButton') {
            shutdown();
        }
    });
});
