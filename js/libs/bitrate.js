export default function setBitrate(formElements) {
    const videoSize = formElements.filter(item => {
        return (item.name === 'videoSize');
    })[0];
    if (videoSize && videoSize.selectedOptions && videoSize.selectedOptions[0].value !== '') {
        const videoOption = videoSize.selectedOptions[0].value.split(' ');
        const [width, height] = videoOption.filter(item => {
            return parseInt(item);
        });
        const wxh = width * height;
        let bitrate = 15000000;
        if (wxh === 307200 || wxh === 480000) {
            // 640 x 480
            bitrate = 15000000;
        } else if (wxh === 921600) {
            // 1280 x 720
            bitrate = 10000000;
        } else {
            // everything else
            bitrate = 5000000;
        }
        return `--bitrate ${bitrate}`;
    }
    return '';
}
