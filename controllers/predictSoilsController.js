const tf = require('@tensorflow/tfjs-node');
const mlService = require('../utils/mlService');

const MODEL_PATH = process.env.MODEL_SOILS_PATH;
const CLASSES = [
  'Alluvial Soil', 'Black Soil', 'Clay Soil', 'Red Soil', 'Sandy Soil'
];

let model;

/**
 * Loads the soil classification model using Layers API
 */
const loadModel = async () => {
  if (model) return model;
  try {
    // Soils model specifically uses loadLayersModel
    model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
    console.log("Soils model loaded successfully.");
    return model;
  } catch (error) {
    console.error("Soils Model Load Error:", error);
  }
};

/**
 * Core prediction logic for soil types
 */
const predictSoilClass = async (imagePath) => {
  const currentModel = await loadModel();
  if (!currentModel) throw new Error('Model not initialized');

  // Standardized preprocessing via mlService
  const tensor = await mlService.preprocessImage(imagePath, { 
    width: 224, 
    height: 224, 
    fit: 'fill' 
  });

  const prediction = currentModel.predict(tensor);
  const probabilities = prediction.dataSync(); // Standardized from arraySync
  
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));

  return {
    predictedClass: CLASSES[maxIndex],
    probability: probabilities[maxIndex],
    allProb: mlService.getTopMatches(probabilities, CLASSES)
  };
};

/**
 * Express handler for soil prediction requests
 */
const handleSoilPhotoPrediction = async (req, res) => {
  try {
    const result = await predictSoilClass(req.file.path);
    res.json({
      message: "Soil photo processed successfully",
      ...result
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Error processing soil photo" });
  }
};

// Initial load
loadModel();

module.exports = {
  handleSoilsPhotoPrediction: handleSoilPhotoPrediction,
  predictSoilClass
};