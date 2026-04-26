const tf = require('@tensorflow/tfjs-node');
const mlService = require('../utils/mlService');

const MODEL_PATH = process.env.MODEL_DISEASES_PATH;
const CLASSES = [
  'Bacterial Blight', 'Curl Virus', 'Fusarium Wilt', 
  'Healthy', 'Powdery Mildew', 'Target Spot'
];

let model;

const loadModel = async () => {
  if (model) return model;
  try {
    model = await tf.loadGraphModel(`file://${MODEL_PATH}`);
    return model;
  } catch (error) {
    console.error("Diseases Model Load Error:", error);
  }
};

const predictDiseaseClass = async (imagePath) => {
  const currentModel = await loadModel();
  if (!currentModel) throw new Error('Model not initialized');

  const tensor = await mlService.preprocessImage(imagePath);
  const prediction = currentModel.predict(tensor);
  const probabilities = prediction.dataSync();

  const maxIndex = probabilities.indexOf(Math.max(...probabilities));
  
  return {
    predictedClass: CLASSES[maxIndex],
    probability: probabilities[maxIndex],
    allProb: mlService.getTopMatches(probabilities, CLASSES)
  };
};

const handleDiseasePhotoPrediction = async (req, res) => {
  try {
    const result = await predictDiseaseClass(req.file.path);
    res.json({
      message: "Disease photo processed successfully",
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing disease photo" });
  }
};

loadModel(); // Background init

module.exports = { handleDiseasePhotoPrediction, predictDiseaseClass };