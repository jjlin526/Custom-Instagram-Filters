var imgs = [];
var avgImg;
// Composite image that has been interpolated with image displayed on left
var interpolatedImg;
var numOfImages = 30;
// Index of current image displayed on left
var currImageIndex = 0;

//////////////////////////////////////////////////////////
function preload() {
  // preload() runs once
  // Load and store all 30 faces in memory
  for (var index = 0; index < numOfImages; ++index) {
    // Relative path to image
    var fileName = "assets/" + index + ".jpg";
    // Store image of face based on path
    imgs.push(loadImage(fileName));
  }
}

//////////////////////////////////////////////////////////
function setup() {
  // Scale canvas based on first image's dimensions
  createCanvas(imgs[0].width * 2, imgs[0].height);
  // Set appropriate factor for pixel density
  pixelDensity(1);
  // Create empty off-screen graphics buffer to save calculation results
  avgImg = createGraphics(imgs[0].width, imgs[0].height);
  // Create empty off-screen graphics buffer to save interpolated composite image
  interpolatedImg = createGraphics(imgs[0].width, imgs[0].height);
}
//////////////////////////////////////////////////////////
function draw() {
  // Set background to gray
  background(125);
  // Draw the first image on the left of canvas
  image(imgs[0], 0, 0);

  // Make pixel array accessible for each face in memory
  for (var index = 0; index < numOfImages; ++index) {
    imgs[index].loadPixels();
  }
  // Load data in buffer images -- composite and interpolated images
  avgImg.loadPixels();
  interpolatedImg.loadPixels();

  // Iterate over all pixels in each array image
  for (var widthIndex = 0; widthIndex < imgs[0].width; ++widthIndex) {
    for (var heightIndex = 0; heightIndex < imgs[0].height; ++heightIndex) {
      // Store sum of RGB channels for each pixel for each face
      var sumR = 0;
      var sumG = 0;
      var sumB = 0;
      for (var imageIndex = 0; imageIndex < numOfImages; ++imageIndex) {
        // Convert 2D X and Y coordinate to a 1D pixel index value in the pixel array
        var pixelArrayIndex = (heightIndex * imgs[0].width + widthIndex) * 4;
        // Use pixel index to store sum of each pixel's RGB values from 0 - 255
        sumR += imgs[imageIndex].pixels[pixelArrayIndex + 0];
        sumG += imgs[imageIndex].pixels[pixelArrayIndex + 1];
        sumB += imgs[imageIndex].pixels[pixelArrayIndex + 2];
      }
      // Update composite image to represent the average pixel of all 30 faces
      avgImg.pixels[pixelArrayIndex + 0] = sumR / numOfImages;
      avgImg.pixels[pixelArrayIndex + 1] = sumG / numOfImages;
      avgImg.pixels[pixelArrayIndex + 2] = sumB / numOfImages;
      // Set alpha component to 255 to minimize transparency
      avgImg.pixels[pixelArrayIndex + 3] = 255;
    }
  }

  // Apply changes to average image
  avgImg.updatePixels();

  // Display average image
  image(avgImg, imgs[0].width, 0);

  // Limit calculations performed
  noLoop();
}

// Function that draws a random image from the faces array on the left when a key is pressed
function keyPressed() {
  // Generate random index from 0 - 29
  currImageIndex = Math.floor(random(0, 30));
  // Draw image at index to canvas
  image(imgs[currImageIndex], 0, 0);
  console.log(currImageIndex);
}

/* Function that transitions the pixel values of the second image from the average image to the
randomly selected image based on the mouse's X coordinate value*/
function mouseMoved() {
  // Interpolation amount depends on mouse's X coordinate
  var unconstrainedLerpAmount = mouseX / (imgs[0].width * 2);
  // Constrain the interpolation amount to remain within bounds to eliminate unexpected colors
  var constrainedLerpAmount = constrain(unconstrainedLerpAmount, 0, 1);
  // Perform interpolation between each pixel in the composite image and each pixel in the image displayed on left
  for (var widthIndex = 0; widthIndex < imgs[0].width; ++widthIndex) {
    for (var heightIndex = 0; heightIndex < imgs[0].height; ++heightIndex) {
      // Compute pixel index to interpolate
      var compositeIndex = (heightIndex * imgs[0].width + widthIndex) * 4;
      // Blend composite pixel color with current face pixel color based on interpolation amount
      var interpolatedColor = lerpColor(
        // RGB color of composite image for given pixel
        color(
          avgImg.pixels[compositeIndex + 0],
          avgImg.pixels[compositeIndex + 1],
          avgImg.pixels[compositeIndex + 2]
        ),
        // RGB color of image on left for given pixel
        color(
          imgs[currImageIndex].pixels[compositeIndex + 0],
          imgs[currImageIndex].pixels[compositeIndex + 1],
          imgs[currImageIndex].pixels[compositeIndex + 2]
        ),
        // Degree of interpolation
        constrainedLerpAmount
      );
      // Update interpolated image RGB channels with blended values
      interpolatedImg.pixels[compositeIndex + 0] = red(interpolatedColor);
      interpolatedImg.pixels[compositeIndex + 1] = green(interpolatedColor);
      interpolatedImg.pixels[compositeIndex + 2] = blue(interpolatedColor);
      // Ensure that the pixel is visible
      interpolatedImg.pixels[compositeIndex + 3] = 255;
    }
  }
  // Update the pixels in the interpolated image
  interpolatedImg.updatePixels();
  // Replace composite image with interpolated image with same location and dimensions
  image(interpolatedImg, imgs[0].width, 0);
}
