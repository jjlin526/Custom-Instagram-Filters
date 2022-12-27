// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg
var imgIn;
// Default filter -- sepia, vignetting and radial blur
var defaultState = true;
// Set all other filter states to inactive
var sharpenGreyscaleState = false;
var sharpenState = false;
var sharpenSepiaState = false;
var invertSepiaState = false;
// Collection of convolution kernels
var matrix = [
  // Convolution kernel for radial blur filter
  [
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
  ],
  // Convolution kernel for sharpen filter
  [
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, 25, -1, -1],
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
  ],
];
/////////////////////////////////////////////////////////////////
function preload() {
  imgIn = loadImage("assets/husky.jpg");
}
/////////////////////////////////////////////////////////////////
function setup() {
  createCanvas(imgIn.width * 2, imgIn.height + 160);
}
/////////////////////////////////////////////////////////////////
function draw() {
  // Draw black background
  background(255);
  // Draw unfiltered image
  image(imgIn, 0, 0);
  // Draw filtered image
  image(earlyBirdFilter(imgIn), imgIn.width, 0);
  // Display instructions
  textSize(25);
  fill(0);
  text("Press 'q' for sharpen + greyscale", 20, height - 120);
  text("Press 'w' for sharpen", 20, height - 75);
  text("Press 'e' for sharpen + sepia", 20, height - 30);
  text("Press 'r' for inverted + sepia", width / 3, height - 120);
  text("Press 't' for default", width / 3, height - 75);

  noLoop();
}
/////////////////////////////////////////////////////////////////
function mousePressed() {
  loop();
}
/////////////////////////////////////////////////////////////////
function earlyBirdFilter(img) {
  var resultImg = createImage(imgIn.width, imgIn.height);
  // Execute a series of filters based on program state
  if (defaultState) {
    resultImg = sepiaFilter(imgIn);
    resultImg = darkCorners(resultImg);
    resultImg = radialBlurFilter(resultImg);
    resultImg = borderFilter(resultImg);
  } else if (sharpenGreyscaleState) {
    resultImg = sharpenFilter(imgIn);
    resultImg = greyscaleFilter(resultImg);
  } else if (sharpenState) {
    resultImg = sharpenFilter(imgIn);
  } else if (sharpenSepiaState) {
    resultImg = sharpenFilter(imgIn);
    resultImg = sepiaFilter(resultImg);
  } else if (invertSepiaState) {
    resultImg = invertFilter(imgIn);
    resultImg = sepiaFilter(resultImg);
  }
  return resultImg;
}

// Function that turns an image into sepia -- similar to the invert filter
function sepiaFilter(img) {
  // Create fresh buffer of pixels based on original image
  var imgOut = createImage(img.width, img.height);
  // Load pixels for the display window into the pixels array for the original and modified image
  img.loadPixels();
  imgOut.loadPixels();

  // Scan each pixel in original image
  for (var xPixelCoord = 0; xPixelCoord < img.width; ++xPixelCoord) {
    for (var yPixelCoord = 0; yPixelCoord < img.height; ++yPixelCoord) {
      // Determine index for pixel in pixel array
      var pixelArrayIndex = (img.width * yPixelCoord + xPixelCoord) * 4;
      // Extract RGB channel values for pixel in original image
      oldRed = img.pixels[pixelArrayIndex + 0];
      oldGreen = img.pixels[pixelArrayIndex + 1];
      oldBlue = img.pixels[pixelArrayIndex + 2];
      // Apply sepia filter to RGB channels
      newRed = oldRed * 0.393 + oldGreen * 0.769 + oldBlue * 0.189;
      newGreen = oldRed * 0.349 + oldGreen * 0.686 + oldBlue * 0.168;
      newBlue = oldRed * 0.272 + oldGreen * 0.534 + oldBlue * 0.131;
      // Apply modified RGB channels to filtered image
      imgOut.pixels[pixelArrayIndex + 0] = newRed;
      imgOut.pixels[pixelArrayIndex + 1] = newGreen;
      imgOut.pixels[pixelArrayIndex + 2] = newBlue;
      // Make filtered image visible
      imgOut.pixels[pixelArrayIndex + 3] = 255;
    }
  }
  // Update display window with data in filtered pixels array
  imgOut.updatePixels();
  return imgOut;
}

// Function that adds dark corners (i.e. vignetting) to an image, providing an older feel
function darkCorners(img) {
  // Original RGB channels for a given pixel
  var oldRed;
  var oldGreen;
  var oldBlue;
  // New RGB channels for a pixel with vignetting filter applied
  var vignettedRed;
  var vignettedGreen;
  var vignettedBlue;
  // Create fresh buffer of pixels based on original image
  var imgOut = createImage(img.width, img.height);
  // Load pixels from the display window into the pixels array for the original and modified image
  img.loadPixels();
  imgOut.loadPixels();
  // Scan each pixel in original image
  for (var xPixelCoord = 0; xPixelCoord < img.width; ++xPixelCoord) {
    for (var yPixelCoord = 0; yPixelCoord < img.height; ++yPixelCoord) {
      // Dynamic luminance -- factor by which a pixel channel's luminosity will be altered by
      var dynLum;
      // Determine index for pixel in pixel array
      var pixelArrayIndex = (img.width * yPixelCoord + xPixelCoord) * 4;
      // Compute distance of pixel from center of image
      var distanceFromCenter = dist(
        xPixelCoord,
        yPixelCoord,
        img.width / 2,
        img.height / 2
      );
      // Adjust the luminosity or brightness of a pixel by a factor based on its distance from image's center point
      if (distanceFromCenter < 300) dynLum = 1;
      else if (distanceFromCenter >= 300 && distanceFromCenter < 450)
        dynLum = map(distanceFromCenter, 300, 449, 1, 0.4);
      else if (distanceFromCenter >= 450)
        dynLum = map(
          distanceFromCenter,
          450,
          // Compute maximum distance a pixel can be from the center using Pythagorean Theorem
          Math.sqrt(Math.pow(img.width / 2, 2) + Math.pow(img.height / 2, 2)),
          0.4,
          0
        );
      // Constrain the dynamic luminance to be within bounds as a means of defensive programming
      dynLum = constrain(dynLum, 0, 1);
      // Extract RGB channel values for pixel in original image
      oldRed = img.pixels[pixelArrayIndex + 0];
      oldGreen = img.pixels[pixelArrayIndex + 1];
      oldBlue = img.pixels[pixelArrayIndex + 2];
      // Apply vignetting filter to RGB channels
      vignettedRed = oldRed * dynLum;
      vignettedGreen = oldGreen * dynLum;
      vignettedBlue = oldBlue * dynLum;
      // Apply modified RGB channels to filtered image
      imgOut.pixels[pixelArrayIndex + 0] = vignettedRed;
      imgOut.pixels[pixelArrayIndex + 1] = vignettedGreen;
      imgOut.pixels[pixelArrayIndex + 2] = vignettedBlue;
      // Make filtered image visible
      imgOut.pixels[pixelArrayIndex + 3] = 255;
    }
  }
  // Update display window with data in filtered pixels array
  imgOut.updatePixels();
  return imgOut;
}

// Function that creates a radial blur that blurs based on distance from mouse coordinate
function radialBlurFilter(img) {
  // Original RGB channels for a given pixel
  var oldRed;
  var oldGreen;
  var oldBlue;
  // Create fresh buffer of pixels based on original image
  var imgOut = createImage(img.width, img.height);
  // Store size of convolutional matrix
  var matrixSize = matrix[0].length;
  // Load pixels from the display window into the pixels array for the original and modified image
  imgOut.loadPixels();
  img.loadPixels();
  // Read every pixel
  for (var xPixelCoord = 0; xPixelCoord < imgOut.width; xPixelCoord++) {
    for (var yPixelCoord = 0; yPixelCoord < imgOut.height; yPixelCoord++) {
      // Scale blur dynamically based on distance from mouse coordinate position in original image
      var dynBlur = map(
        dist(mouseX, mouseY, xPixelCoord, yPixelCoord),
        100,
        300,
        0,
        1
      );
      // Constrain the dynamic blur to be within bounds as a means of defensive programming
      dynBlur = constrain(dynBlur, 0, 1);
      // Determine 1D pixel array index based on 2D coordinate
      var pixelArrayIndex = (xPixelCoord + yPixelCoord * imgOut.width) * 4;
      // Extract RGB channel values for pixel in original image
      oldRed = img.pixels[pixelArrayIndex + 0];
      oldGreen = img.pixels[pixelArrayIndex + 1];
      oldBlue = img.pixels[pixelArrayIndex + 2];
      // Apply convolution kernel to pixel
      var convolutionPixelColor = convolution(
        xPixelCoord,
        yPixelCoord,
        matrix[0],
        matrixSize,
        img
      );
      // Apply dynamic radial blur to R, G and B channels
      imgOut.pixels[pixelArrayIndex + 0] =
        convolutionPixelColor[0] * dynBlur + oldRed * (1 - dynBlur);
      imgOut.pixels[pixelArrayIndex + 1] =
        convolutionPixelColor[1] * dynBlur + oldGreen * (1 - dynBlur);
      imgOut.pixels[pixelArrayIndex + 2] =
        convolutionPixelColor[2] * dynBlur + oldBlue * (1 - dynBlur);
      imgOut.pixels[pixelArrayIndex + 3] = 255;
    }
  }
  // Update display window with data in filtered pixels array
  imgOut.updatePixels();
  return imgOut;
}

// Function that uses convolution kernel to return a new color based on neighboring pixels
function convolution(x, y, matrix, matrixSize, img) {
  // Store total RGB channel values
  var totalRed = 0.0;
  var totalGreen = 0.0;
  var totalBlue = 0.0;
  // Offset provides access to all neighbouring pixels in convolution kernel
  var offset = floor(matrixSize / 2);
  // Convolution matrix loop
  for (var xPixelCoord = 0; xPixelCoord < matrixSize; xPixelCoord++) {
    for (var yPixelCoord = 0; yPixelCoord < matrixSize; yPixelCoord++) {
      // Get pixel location within convolution matrix
      var xLocation = x + xPixelCoord - offset;
      var yLocation = y + yPixelCoord - offset;
      var index = (xLocation + img.width * yLocation) * 4;
      // Ensure we do not address a pixel that does not exist
      index = constrain(index, 0, img.pixels.length - 1);
      // Multiply all values with the mask and compute sum
      totalRed += img.pixels[index + 0] * matrix[xPixelCoord][yPixelCoord];
      totalGreen += img.pixels[index + 1] * matrix[xPixelCoord][yPixelCoord];
      totalBlue += img.pixels[index + 2] * matrix[xPixelCoord][yPixelCoord];
    }
  }
  // Return the new color
  return [totalRed, totalGreen, totalBlue];
}

// Function that adds rounded corners to image
function borderFilter(img) {
  // Create local off-screen buffer
  var buffer = createGraphics(img.width, img.height);
  // Draw image onto buffer
  buffer.image(img, 0, 0);
  // Set border around shape to be a thick and white
  buffer.stroke(255);
  buffer.strokeWeight(30);
  // Disable filling geometry
  buffer.noFill();
  // Draw rounded white rectangle border
  buffer.rect(0, 0, img.width, img.height, 60);
  // Draw non-rounded white rectangle to remove black triangles around image
  buffer.rect(0, 0, img.width, img.height);
  // Output local buffer
  return buffer;
}

// Function that applies a filter to image based on key pressed
function keyTyped() {
  resetState();
  if (key === "q") {
    sharpenGreyscaleState = true;
  } else if (key === "w") {
    sharpenState = true;
  } else if (key === "e") {
    sharpenSepiaState = true;
  } else if (key === "r") {
    invertSepiaState = true;
  } else {
    defaultState = true;
  }
  loop();
}

// Function that resets the state of all applied filters
function resetState() {
  defaultState = false;
  sharpenGreyscaleState = false;
  sharpenSepiaState = false;
  sharpenState = false;
  invertSepiaState = false;
}

// Function that applies a weighted greyscale filter to image
function greyscaleFilter(img) {
  // Original RGB channels for a given pixel
  var oldRed;
  var oldGreen;
  var oldBlue;
  // Create fresh buffer of pixels based on original image
  var imgOut = createImage(img.width, img.height);
  // Load pixels for the display window into the pixels array for the original and modified image
  img.loadPixels();
  imgOut.loadPixels();
  // Scan each pixel in original image
  for (var xPixelCoord = 0; xPixelCoord < img.width; ++xPixelCoord) {
    for (var yPixelCoord = 0; yPixelCoord < img.height; ++yPixelCoord) {
      // Determine index for pixel in pixel array
      var pixelArrayIndex = (img.width * yPixelCoord + xPixelCoord) * 4;
      // Extract RGB channel values for pixel in original image
      oldRed = img.pixels[pixelArrayIndex + 0];
      oldGreen = img.pixels[pixelArrayIndex + 1];
      oldBlue = img.pixels[pixelArrayIndex + 2];
      // Apply weighted RGB to greyscale conversion to account for human perception of color
      var weightedGreyscale = map(
        0.299 * oldRed + 0.587 * oldGreen + 0.114 * oldBlue,
        0,
        1020,
        0,
        255
      );
      // Ensure that weighted greyscale is within bounds
      weightedGreyscale = constrain(weightedGreyscale, 0, 255);
      // Apply weighted greyscale to filtered image
      imgOut.pixels[pixelArrayIndex + 0] = weightedGreyscale;
      imgOut.pixels[pixelArrayIndex + 1] = weightedGreyscale;
      imgOut.pixels[pixelArrayIndex + 2] = weightedGreyscale;
      // Make filtered image visible
      imgOut.pixels[pixelArrayIndex + 3] = 255;
    }
  }
  // Update display window with data in filtered pixels array
  imgOut.updatePixels();
  return imgOut;
}

// Function that sharpens an image by enhancing its edges
function sharpenFilter(img) {
  // Original RGB channels for a given pixel
  var oldRed;
  var oldGreen;
  var oldBlue;
  // Create fresh buffer of pixels based on original image
  var imgOut = createImage(img.width, img.height);
  // Load pixels for the display window into the pixels array for the original and modified image
  img.loadPixels();
  imgOut.loadPixels();
  // Scan each pixel in original image
  for (var xPixelCoord = 0; xPixelCoord < img.width; ++xPixelCoord) {
    for (var yPixelCoord = 0; yPixelCoord < img.height; ++yPixelCoord) {
      // Determine index for pixel in pixel array
      var pixelArrayIndex = (img.width * yPixelCoord + xPixelCoord) * 4;
      // Extract RGB channel values for pixel in original image
      oldRed = img.pixels[pixelArrayIndex + 0];
      oldGreen = img.pixels[pixelArrayIndex + 1];
      oldBlue = img.pixels[pixelArrayIndex + 2];
      // Apply convolution kernel to pixel
      var convolutionPixelColor = convolution(
        xPixelCoord,
        yPixelCoord,
        matrix[1],
        matrix[1].length,
        img
      );
      // Apply "sharpened" RGB channel values to pixel
      imgOut.pixels[pixelArrayIndex + 0] = convolutionPixelColor[0];
      imgOut.pixels[pixelArrayIndex + 1] = convolutionPixelColor[1];
      imgOut.pixels[pixelArrayIndex + 2] = convolutionPixelColor[2];
      // Make filtered image visible
      imgOut.pixels[pixelArrayIndex + 3] = 255;
    }
  }
  // Update display window with data in filtered pixels array
  imgOut.updatePixels();
  return imgOut;
}

// Function that inverts an image's color samples
function invertFilter(img) {
  // Original RGB channels for a given pixel
  var oldRed;
  var oldGreen;
  var oldBlue;
  // Inverted RGB channels for a given pixel
  var newRed;
  var newGreen;
  var newBlue;
  // Create fresh buffer of pixels based on original image
  var imgOut = createImage(img.width, img.height);
  // Load pixels for the display window into the pixels array for the original and modified image
  img.loadPixels();
  imgOut.loadPixels();
  // Scan each pixel in original image
  for (var xPixelCoord = 0; xPixelCoord < img.width; ++xPixelCoord) {
    for (var yPixelCoord = 0; yPixelCoord < img.height; ++yPixelCoord) {
      // Determine index for pixel in pixel array
      var pixelArrayIndex = (img.width * yPixelCoord + xPixelCoord) * 4;
      // Extract RGB channel values for pixel in original image
      oldRed = img.pixels[pixelArrayIndex + 0];
      oldGreen = img.pixels[pixelArrayIndex + 1];
      oldBlue = img.pixels[pixelArrayIndex + 2];
      // Invert RGB channel values
      newRed = 255 - oldRed;
      newGreen = 255 - oldGreen;
      newBlue = 255 - oldBlue;
      // Apply inverted RGB channel values to pixel
      imgOut.pixels[pixelArrayIndex + 0] = newRed;
      imgOut.pixels[pixelArrayIndex + 1] = newGreen;
      imgOut.pixels[pixelArrayIndex + 2] = newBlue;
      // Make filtered image visible
      imgOut.pixels[pixelArrayIndex + 3] = 255;
    }
  }
  // Update display window with data in filtered pixels array
  imgOut.updatePixels();
  return imgOut;
}
