const tf = require('@tensorflow/tfjs-node');
const mlService = require('../utils/mlService');

const MODEL_PATH = process.env.MODEL_PATH;
const CLASSES = [
  'Ambrosia trifida (Ambrozia)', 'Sorghum halepense (Costrei)', 
  'Sinapis arvensis (Mustar Salbatic)', 'Cirsium arvense (Palamida)', 
  'Agropyron repens (Pir Tarator)', 'Veronica hederifolia (Soparlita)', 
  'Amaranthus retroflexus (Stir Salbatic)', 'Convolvulus arvensis (Volbura)'
];

let model;

const loadModel = async () => {
  if (model) return model;
  try {
    // Note: Weeds uses LayersModel while others use GraphModel
    model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
    return model;
  } catch (error) {
    console.error("Weeds Model Load Error:", error);
  }
};

const handleWeedPhotoPrediction = async (req, res) => {
  try {
    const currentModel = await loadModel();
    if (!currentModel) throw new Error('Model not loaded');

    const tensor = await mlService.preprocessImage(req.file.path);
    const prediction = currentModel.predict(tensor);
    const probabilities = prediction.dataSync();
    
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));

    res.json({
      message: "Weed photo processed successfully",
      predictedClass: CLASSES[maxIndex],
      probability: probabilities[maxIndex],
      allProb: mlService.getTopMatches(probabilities, CLASSES)
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing weed photo" });
  }
};

loadModel();

module.exports = { handleWeedPhotoPrediction };