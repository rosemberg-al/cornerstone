import generateLutNew from './generateLutNew.js';

/**
 * Creates a LUT used while rendering to convert stored pixel values to
 * display pixels
 *
 * @param image
 * @param windowWidth
 * @param windowCenter
 * @param invert
 * @param modalityLUT
 * @param voiLUT
 * @returns {Uint8ClampedArray}
 */
export default function (image, windowWidth, windowCenter, invert, modalityLUT, voiLUT) {
  if (modalityLUT || voiLUT) {
    return generateLutNew(image, windowWidth, windowCenter, invert, modalityLUT, voiLUT);
  }

  if (image.cachedLut === undefined) {
    const length = image.maxPixelValue - Math.min(image.minPixelValue, 0) + 1;

    image.cachedLut = {};
    image.cachedLut.lutArray = new Uint8ClampedArray(length);
  }
  const lut = image.cachedLut.lutArray;
  const maxPixelValue = image.maxPixelValue;
  const minPixelValue = image.minPixelValue;
  const slope = image.slope;
  const intercept = image.intercept;
  let modalityLutValue;
  let voiLutValue;

  // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
  // We improve performance by offsetting the pixel values for signed data to avoid negative indexes
  // When generating the lut and then undo it in storedPixelDataToCanvasImagedata.  Thanks to @jpambrun
  // For this contribution!

  let offset = 0;

  if (minPixelValue < 0) {
    offset = minPixelValue;
  }

  if (invert === true) {
    for (let storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      modalityLutValue = storedValue * slope + intercept;
      voiLutValue = (((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0);
      lut[storedValue + (-offset)] = 255 - voiLutValue;
    }
  } else {
    for (let storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      modalityLutValue = storedValue * slope + intercept;
      voiLutValue = (((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0);
      lut[storedValue + (-offset)] = voiLutValue;
    }
  }

  return lut;
}
