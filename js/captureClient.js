import * as formUtils from '/js/libs/formUtils.js';

const {
    listImageCaptures,
    shutdown,
    executeServerCommand,
    stopPreview,
    startPreview,
    videoUpdate,
    displayImages,
    updateImage
} = formUtils;

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
                    const selectOpts = form[field.name].options;
                    Array.from(selectOpts).find(item => {
                        console.log(item.value, opts.value, opts.value === item.value);
                    });
                }
                //form[field.name].selectedOptions[0].value = field.value;
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {

    const mainForm = document.forms['mainForm'];
    const imageFormObj = document.forms['imageOptions'];
    listImageCaptures();

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
            updateImage(imageFormObj);
        } else if (target.id === 'renameFile') {
            const VALID_CHARACTERS = /[a-zA-Z]/g;
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            const fname = (mainForm['new-name'].value || '').match(VALID_CHARACTERS).join('');
            executeServerCommand(`/renameFile?oldname=${currentItem}&name=${fname}`);
        } else if (target.id === 'deleteFile') {
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            executeServerCommand(`/deleteFile?name=${currentItem}`);
        } else if (target.id === 'viewImageOrVideo') {
            const currentItem = mainForm['image_list'].selectedOptions[0].value.trim();
            const isImage = currentItem.endsWith('.png');
            displayImages(`/viewImageOrVideo?name=${currentItem}`, isImage);
        } else if (target.id === 'imageCapture') {
            const imageCount = document.forms['saveImages'].imagecount.value;
            executeServerCommand(`/saveImage?count=${imageCount}`);
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
