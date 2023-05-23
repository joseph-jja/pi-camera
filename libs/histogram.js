const cv = require('opencv4nodejs');
const fs = require('fs');
const { createCanvas, createImageData } = require('canvas');
const { Image } = require('canvas');

function createHistogram(imageStream) {
  // Convert the image stream to a Buffer
  const buffer = Buffer.from(imageStream);

  // Read the image from the buffer
  const image = cv.imdecode(buffer);

  // Convert the image to grayscale
  const grayImage = image.bgrToGray();

  // Calculate the histogram
  const histogram = grayImage.calcHist([0], [0], null, [256], [0, 256]);

  // Plot the histogram using canvas
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  // Draw the histogram
  const imageData = createImageData(new Uint8ClampedArray(histogram.getData()), histogram.rows, histogram.cols);
  ctx.putImageData(imageData, 0, 0);

  // Save the histogram as an image
  const histogramImage = canvas.toBuffer('image/png');
  fs.writeFileSync('histogram.png', histogramImage);
}

// Example usage:
// Assuming you have an image stream 'imageStream' containing the image data
createHistogram(imageStream);

