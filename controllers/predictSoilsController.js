const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

const { createPredictionController } = require('./predictionControllerFactory');

const SOIL_CLASSES = [
  'Alluvial Soil',
  'Black Soil',
  'Clay Soil',
  'Red Soil',
  'Sandy Soil',
];

const soilPredictionController = createPredictionController({
  modelPath: process.env.MODEL_SOILS_PATH,
  loadModel: tf.loadLayersModel,
  classNames: SOIL_CLASSES,
  successMessage: 'Soil photo processed successfully',
  errorMessage: 'Error processing soil photo',
  imageOptions: {
    channels: 3,
    format: 'png',
    useArraySync: true,
    resizeOptions: {
      fit: 'fill',
    },
  },
});

module.exports = {
  handleSoilsPhotoPrediction: soilPredictionController.handlePhotoPrediction,
  predictSoilClass: soilPredictionController.predictImageClass,
};