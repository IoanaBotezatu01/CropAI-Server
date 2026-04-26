const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');

/**
 * Shared logic for image preprocessing and TensorFlow model interaction
 */
const MLService = {
  // Registers custom components once for the application
  registerCustomL2() {
    class CustomL2Regularizer extends tf.regularizers.l2 {
      static className = 'L2';
      constructor(config) {
        super({ l2: config.l2 || 0.01 });
      }
    }
    try {
      tf.serialization.registerClass(CustomL2Regularizer);
    } catch (e) {
      // Avoid re-registration errors during hot-reloads
    }
  },

  async preprocessImage(imagePath, options = { width: 224, height: 224 }) {
    const imageBuffer = await sharp(imagePath)
      .resize(options)
      .toBuffer();

    return tf.node.decodeImage(imageBuffer, 3)
      .expandDims(0)
      .div(tf.scalar(255.0));
  },

  getTopMatches(probabilities, classes, count = 3) {
    const probMap = {};
    classes.forEach((className, index) => {
      probMap[className] = probabilities[index];
    });

    return Object.entries(probMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .reduce((obj, [key, value]) => {
        obj[key] = value * 100;
        return obj;
      }, {});
  }
};

MLService.registerCustomL2();
module.exports = MLService;