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
