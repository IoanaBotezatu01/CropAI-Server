const Location = require('../models/locationModel');

const EARTH_RADIUS_KM = 6371;
const NEARBY_DISTANCE_LIMIT_KM = 100;

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const latitudeDistance = degreesToRadians(lat2 - lat1);
  const longitudeDistance = degreesToRadians(lon2 - lon1);

  const haversineValue =
    Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(longitudeDistance / 2) *
      Math.sin(longitudeDistance / 2);

  const angularDistance = 2 * Math.atan2(
    Math.sqrt(haversineValue),
    Math.sqrt(1 - haversineValue)
  );

  return EARTH_RADIUS_KM * angularDistance;
}

function isLocationNearby(originLatitude, originLongitude, location) {
  const distance = getDistanceFromLatLonInKm(
    originLatitude,
    originLongitude,
    location.latitude,
    location.longitude
  );

  return distance <= NEARBY_DISTANCE_LIMIT_KM;
}

const locationController = {
  add: async (req, res) => {
    const { userId, latitude, longitude, name } = req.body;

    try {
      const newLocation = new Location({
        userId,
        latitude,
        longitude,
        name,
      });

      await newLocation.save();

      res.status(201).json({
        message: 'Location added successfuly!',
        locationId: newLocation._id,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.toString() });
    }
  },

  getLocationByUserId: async (req, res) => {
    const { userId } = req.params;

    try {
      const locations = await Location.find({ userId });

      if (!locations) {
        return res.status(404).json({ error: 'Locations not found' });
      }

      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  },

  getLocationById: async (req, res) => {
    const { locationId } = req.params;

    try {
      const location = await Location.findById(locationId);

      if (!location) {
        return res.status(404).json({ error: 'Locations not found' });
      }

      res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  },

  getUsersByLocation: async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing latitude or longitude in query' });
    }

    try {
      const originLatitude = parseFloat(latitude);
      const originLongitude = parseFloat(longitude);
      const locations = await Location.find();
      const nearbyUserIds = new Set();

      locations.forEach((location) => {
        if (isLocationNearby(originLatitude, originLongitude, location)) {
          nearbyUserIds.add(location.userId);
        }
      });

      console.log(nearbyUserIds);

      res.status(200).json({ userIds: Array.from(nearbyUserIds) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    }
  },
};

module.exports = locationController;