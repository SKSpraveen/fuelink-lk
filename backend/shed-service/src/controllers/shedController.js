const Shed = require("../models/Shed");


// CREATE SHED
const createShed = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      fuelTypes,
    } = req.body;

    const shed = await Shed.create({
      name,
      ownerId: req.user.id,
      address,

      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },

      fuelTypes,
    });

    res.status(201).json(shed);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET NEARBY SHEDS
const getNearbySheds = async (req, res) => {
  try {
    const { lat, lng, radius = 4000 } = req.query;

    const sheds = await Shed.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },

          $maxDistance: parseInt(radius),
        },
      },
    });

    res.status(200).json(sheds);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE STOCK
const updateFuelStock = async (req, res) => {
  try {
    const shed = await Shed.findById(req.params.id);

    if (!shed) {
      return res.status(404).json({
        message: "Shed not found",
      });
    }

    // Owner check
    if (shed.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Not your shed",
      });
    }

    shed.fuelTypes = req.body.fuelTypes;

    await shed.save();

    res.status(200).json({
      message: "Fuel stock updated",
      shed,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE QUEUE
const updateQueueStatus = async (req, res) => {
  try {
    const shed = await Shed.findById(req.params.id);

    if (!shed) {
      return res.status(404).json({
        message: "Shed not found",
      });
    }

    if (shed.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Not your shed",
      });
    }

    shed.queueStatus = req.body.queueStatus;

    await shed.save();

    res.status(200).json({
      message: "Queue updated",
      shed,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createShed,
  getNearbySheds,
  updateFuelStock,
  updateQueueStatus,
};