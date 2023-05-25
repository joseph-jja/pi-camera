const fs = require('fs');

const sharp = require('sharp');

// Read the image stream
const imageStream = fs.readFileSync('/home/josepha48/space/Betelguese-20230101190005.png');

// Process the image stream
sharp(imageStream)
  .raw()
  .toBuffer((err, data, info) => {
    if (err) {
      console.error('An error occurred while processing the image:', err);
      return;
    }

    // Calculate the histogram
    const histogram = calculateHistogram(data, info.channels);

    // Print the histogram
    console.log(histogram);
  });

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
