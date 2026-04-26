const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

const { createPredictionController } = require('./predictionControllerFactory');

const PEST_CLASSES = [
  'Ant',
  'Aphids',
  'Bee',
  'Beetle',
  'Caterpillar',
  'Earthworm',
  'Grasshopper',
  'No Pests',
  'Sawfly',
  'Slug',
  'Snail',
  'Wasp',
];

const pestPredictionController = createPredictionController({
  modelPath: process.env.MODEL_PESTS_PATH,
  loadModel: tf.loadGraphModel,
  classNames: PEST_CLASSES,
  successMessage: 'Pest photo processed successfully',
  errorMessage: 'Error processing pest photo',
});

module.exports = {
  handlePestPhotoPrediction: pestPredictionController.handlePhotoPrediction,
  predictPestClass: pestPredictionController.predictImageClass,
};