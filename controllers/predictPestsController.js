const tf = require('@tensorflow/tfjs-node');
const mlService = require('../utils/mlService');

const MODEL_PATH = process.env.MODEL_PESTS_PATH;
const CLASSES = [
  'Ant', 'Aphids', 'Bee', 'Beetle', 'Caterpillar', 'Earthworm', 
  'Grasshopper', 'No Pests', 'Sawfly', 'Slug', 'Snail', 'Wasp'
];

let model;

const loadModel = async () => {
  if (model) return model;
  try {
    model = await tf.loadGraphModel(`file://${MODEL_PATH}`);
    return model;
  } catch (error) {
    console.error("Pests Model Load Error:", error);
  }
};

const handlePestPhotoPrediction = async (req, res) => {
  try {
    const currentModel = await loadModel();
    const tensor = await mlService.preprocessImage(req.file.path);
    const prediction = currentModel.predict(tensor);
    const probabilities = prediction.dataSync();

    const maxIndex = probabilities.indexOf(Math.max(...probabilities));

    res.json({
      message: "Pest photo processed successfully",
      predictedClass: CLASSES[maxIndex],
      probability: probabilities[maxIndex],
      allProb: mlService.getTopMatches(probabilities, CLASSES)
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing pest photo" });
  }
};

loadModel();

module.exports = { handlePestPhotoPrediction };