const Shed = require("../models/Shed");
const QueueSession = require("../models/QueueSession");


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

// GET MY SHEDS
const getMySheds = async (req, res) => {
  try {
    const sheds = await Shed.find({ ownerId: req.user.id });
    res.status(200).json(sheds);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SHED BY ID
const getShedById = async (req, res) => {
  try {
    const shed = await Shed.findById(req.params.id);
    if (!shed) {
      return res.status(404).json({ message: "Shed not found" });
    }
    res.status(200).json(shed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STOCK
const updateFuelStock = async (req, res) => {
  try {
    const shed = await Shed.findById(req.body.shedId);

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
    const shed = await Shed.findById(req.body.shedId);

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

// HELPER: Recalculate Shed Queue Metrics
const recalculateShedQueue = async (shedId) => {
  const activeCount = await QueueSession.countDocuments({ shedId, active: true });
  const shed = await Shed.findById(shedId);
  if (!shed) return;

  shed.queueCount = activeCount;
  shed.waitTime = activeCount * 2; // 2 minutes per vehicle

  if (activeCount <= 5) shed.queueStatus = "LOW";
  else if (activeCount <= 15) shed.queueStatus = "MEDIUM"; 
  else shed.queueStatus = "HIGH";

  await shed.save();
  return shed;
};

// JOIN QUEUE
const joinQueue = async (req, res) => {
  try {
    const { shedId, latitude, longitude } = req.body;
    
    // Check if there's already an active session for this user at this shed
    const existingSession = await QueueSession.findOne({
      userId: req.user.id,
      active: true
    });

    if (existingSession) {
      return res.status(400).json({ message: "You are already in a queue" });
    }

    const session = await QueueSession.create({
      userId: req.user.id,
      shedId,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      active: true,
    });

    const updatedShed = await recalculateShedQueue(shedId);

    res.status(201).json({ session, shed: updatedShed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LEAVE QUEUE
const leaveQueue = async (req, res) => {
  try {
    const { shedId } = req.body;

    const session = await QueueSession.findOne({
      userId: req.user.id,
      shedId,
      active: true
    });

    if (!session) {
      return res.status(404).json({ message: "Active queue session not found" });
    }

    session.active = false;
    session.leftAt = new Date();
    await session.save();

    const updatedShed = await recalculateShedQueue(shedId);

    res.status(200).json({ message: "Left queue successfully", shed: updatedShed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// AUTO LEAVE CRON HELPER
const autoLeaveOldSessions = async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const expiredSessions = await QueueSession.find({
      active: true,
      joinedAt: { $lt: twoHoursAgo }
    });

    if (expiredSessions.length === 0) return;

    const shedIdsToUpdate = new Set();
    
    for (const session of expiredSessions) {
      session.active = false;
      session.leftAt = new Date();
      await session.save();
      shedIdsToUpdate.add(session.shedId.toString());
    }

    for (const shedId of shedIdsToUpdate) {
      await recalculateShedQueue(shedId);
    }
    console.log(`Auto-closed ${expiredSessions.length} old queue sessions.`);
  } catch (error) {
    console.error("Error in autoLeaveOldSessions:", error);
  }
};

module.exports = {
  createShed,
  getNearbySheds,
  getMySheds,
  getShedById,
  updateFuelStock,
  updateQueueStatus,
  joinQueue,
  leaveQueue,
  autoLeaveOldSessions,
};