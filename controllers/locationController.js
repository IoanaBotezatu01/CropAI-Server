const Location = require('../models/locationModel');

const EARTH_RADIUS_KM = 6371;
const PROXIMITY_THRESHOLD_KM = 100;

const deg2rad = (deg) => deg * (Math.PI / 180);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const locationController = {
  add: async (req, res) => {
    try {
      const { userId, latitude, longitude, name } = req.body;
      const newLocation = await Location.create({ userId, latitude, longitude, name });
      
      res.status(201).json({ 
        message: 'Location added successfully!', 
        locationId: newLocation._id 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getUsersByLocation: async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    try {
      const locations = await Location.find().lean();
      const nearbyUserIds = new Set();
      const centerLat = parseFloat(latitude);
      const centerLon = parseFloat(longitude);

      locations.forEach(loc => {
        const dist = calculateDistance(centerLat, centerLon, loc.latitude, loc.longitude);
        if (dist <= PROXIMITY_THRESHOLD_KM) {
          nearbyUserIds.add(loc.userId.toString());
        }
      });

      res.status(200).json({ userIds: Array.from(nearbyUserIds) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve nearby users' });
    }
  }
  // Other methods (getLocationById, etc) follow same pattern...
};

module.exports = locationController;