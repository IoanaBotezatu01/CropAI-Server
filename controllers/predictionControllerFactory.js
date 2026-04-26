const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');

class CustomL2Regularizer extends tf.regularizers.l2 {
  static className = 'L2';

  constructor(config) {
    super({ l2: config.l2 || 0.01 });
  }
}

tf.serialization.registerClass(CustomL2Regularizer);

const IMAGE_SIZE = 224;
const TOP_MATCHES_LIMIT = 3;
const NORMALIZATION_FACTOR = 255.0;

function getTopMatches(classProbabilities, classNames) {
  return classNames
    .map((className, index) => ({
      className,
      probability: classProbabilities[index],
    }))
    .sort((first, second) => second.probability - first.probability)
    .slice(0, TOP_MATCHES_LIMIT)
    .reduce((matches, { className, probability }) => {
      matches[className] = probability * 100;
      return matches;
    }, {});
}

function getPredictedClassIndex(classProbabilities) {
  return classProbabilities.indexOf(Math.max(...classProbabilities));
}

async function createImageTensor(imagePath, imageOptions = {}) {
  const sharpImage = sharp(imagePath).resize({
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    ...imageOptions.resizeOptions,
  });

  if (imageOptions.format) {
    sharpImage.toFormat(imageOptions.format);
  }

  const imageBuffer = await sharpImage.toBuffer();

  return tf.node
    .decodeImage(imageBuffer, imageOptions.channels)
    .expandDims(0)
    .div(tf.scalar(NORMALIZATION_FACTOR));
}

function createPredictionController({
  modelPath,
  loadModel,
  classNames,
  successMessage,
  errorMessage,
  imageOptions,
}) {
  let model;

  async function initializeModel() {
    try {
      console.log(`Loading model from: ${modelPath}`);
      model = await loadModel(`file://${modelPath}`);
      console.log('Model loaded successfully.');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  async function predictImageClass(imagePath) {
    if (!model) {
      throw new Error(
        'Model not loaded. Please ensure the model is loaded before making predictions.'
      );
    }

    const tensor = await createImageTensor(imagePath, imageOptions);
    const prediction = model.predict(tensor);
    const classProbabilities = Array.from(
      imageOptions.useArraySync ? prediction.arraySync()[0] : prediction.dataSync()
    );

    const predictedClassIndex = getPredictedClassIndex(classProbabilities);
    const topMatches = getTopMatches(classProbabilities, classNames);

    console.log(topMatches);

    return {
      predictedClass: classNames[predictedClassIndex],
      probability: classProbabilities[predictedClassIndex],
      allProb: topMatches,
    };
  }

  async function handlePhotoPrediction(req, res) {
    try {
      const result = await predictImageClass(req.file.path);

      console.log(result);

      res.json({
        message: successMessage,
        predictedClass: result.predictedClass,
        probability: result.probability,
        allProb: result.allProb,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: errorMessage });
    }
  }

  initializeModel();

  return {
    handlePhotoPrediction,
    predictImageClass,
  };
}

module.exports = {
  createPredictionController,
};