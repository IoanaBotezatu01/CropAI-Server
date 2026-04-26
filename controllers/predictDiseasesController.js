const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

const { createPredictionController } = require('./predictionControllerFactory');

const DISEASE_CLASSES = [
  'Bacterial Blight',
  'Curl Virus',
  'Fusarium Wilt',
  'Healthy',
  'Powdery Mildew',
  'Target Spot',
];

const diseasePredictionController = createPredictionController({
  modelPath: process.env.MODEL_DISEASES_PATH,
  loadModel: tf.loadGraphModel,
  classNames: DISEASE_CLASSES,
  successMessage: 'Disease photo processed successfully',
  errorMessage: 'Error processing disease photo',
});

module.exports = {
  handleDiseasePhotoPrediction: diseasePredictionController.handlePhotoPrediction,
  predictDiseaseClass: diseasePredictionController.predictImageClass,
};