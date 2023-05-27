const fs = require('fs/promises');

const sharp = require('sharp');

const basedir = process.cwd(),
    {
        captureEmitter
    } = require(`${basedir}/libs/videoScripts`);

// Function to calculate the histogram
function calculateHistogram(data, channels) {
    const histogram = {};

    // Initialize the histogram bins
    for (let i = 0; i < 256; i++) {
        histogram[i] = 0;
    }

    // Iterate over the image data and update the histogram
    for (let i = 0; i < data.length; i += channels) {
        // Assuming the image has RGB channels
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate the grayscale value
        const grayscale = Math.floor((r + g + b) / 3);

        // Increment the corresponding bin in the histogram
        histogram[grayscale]++;
    }

    return histogram;
}

function histogramHandler(err, data, info) {

    if (err) {
        console.error('An error occurred while processing the image:', err);
        
        // send the histogram error
        captureEmitter.emit('histogram', {
            status: 'error',
            error: err
        });
        
        return;
    }

    // Calculate the histogram
    const histogram = calculateHistogram(data, info.channels);

    // send the histogram data
    captureEmitter.emit('histogram', {
        status: 'success',
        data: histogram
    });
}

module.exports = async function getHistogram(filename) {

    // Read the image stream
    const imageStream = await fs.readFile(filename);

    // Process the image stream
    sharp(imageStream).raw().toBuffer(histogramHandler);
}
