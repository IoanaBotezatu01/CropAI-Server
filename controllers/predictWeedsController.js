const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

const { createPredictionController } = require('./predictionControllerFactory');

const WEED_CLASSES = [
  'Ambrosia trifida (Ambrozia)',
  'Sorghum halepense (Costrei)',
  'Sinapis arvensis (Mustar Salbatic)',
  'Cirsium arvense (Palamida)',
  'Agropyron repens (Pir Tarator)',
  'Veronica hederifolia (Soparlita)',
  'Amaranthus retroflexus (Stir Salbatic)',
  'Convolvulus arvensis (Volbura)',
];

const weedPredictionController = createPredictionController({
  modelPath: process.env.MODEL_PATH,
  loadModel: tf.loadLayersModel,
  classNames: WEED_CLASSES,
  successMessage: 'Weed photo processed successfully',
  errorMessage: 'Error processing weed photo',
});

module.exports = {
  handleWeedPhotoPrediction: weedPredictionController.handlePhotoPrediction,
  predictWeedClass: weedPredictionController.predictImageClass,
};