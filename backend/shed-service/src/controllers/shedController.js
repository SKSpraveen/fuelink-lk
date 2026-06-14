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
    shed.manualQueueStatus = req.body.queueStatus;
    shed.manualOverride = true;
    shed.lastRecalculatedAt = new Date();

    await shed.save();

    res.status(200).json({
      message: "Queue status updated manually",
      shed,
      note: "This manual override will be respected until next auto-recalculation cycle"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// HELPER: Recalculate Shed Queue Metrics (ONLY if not manually overridden)
const recalculateShedQueue = async (shedId, forceRecalculate = false) => {
  const shed = await Shed.findById(shedId);
  if (!shed) return;

  // CRITICAL: Don't override manual status unless forced (admin/cron job)
  if (shed.manualOverride && !forceRecalculate) {
    return shed; // ✅ Respect owner's manual decision
  }

  // Check if we've recently recalculated (cache for 60 seconds)
  if (!forceRecalculate && shed.lastRecalculatedAt) {
    const timeSinceLastRecalc = Date.now() - shed.lastRecalculatedAt.getTime();
    if (timeSinceLastRecalc < 60000) {
      return shed; // ✅ Don't recalculate too frequently
    }
  }

  const activeCount = await QueueSession.countDocuments({ shedId, active: true });
  
  shed.queueCount = activeCount;
  shed.waitTime = activeCount * 2; // 2 minutes per vehicle
  shed.lastRecalculatedAt = new Date(); // Track when recalculated

  // Auto-determine status based on count
  if (activeCount <= 5) shed.queueStatus = "LOW";
  else if (activeCount <= 15) shed.queueStatus = "MEDIUM"; 
  else shed.queueStatus = "HIGH";

  shed.manualOverride = false; // Clear manual override after auto-recalc
  
  await shed.save();
  return shed;
};

// JOIN QUEUE with Idempotency Support
const joinQueue = async (req, res) => {
  try {
    const { shedId, latitude, longitude, idempotencyKey } = req.body;
    
    // CRITICAL: Idempotency - prevent duplicate sessions from rapid requests
    // Check if user already has an active session (any shed)
    const existingSession = await QueueSession.findOne({
      userId: req.user.id,
      active: true
    });

    if (existingSession) {
      // ✅ If same shed & same request, return existing session (idempotent)
      if (existingSession.shedId.toString() === shedId) {
        const updatedShed = await recalculateShedQueue(shedId);
        return res.status(200).json({ 
          message: "Already in this queue",
          session: existingSession, 
          shed: updatedShed 
        });
      }
      // ❌ User is in a different queue
      return res.status(400).json({ 
        message: "You are already in a different queue",
        activeShedId: existingSession.shedId
      });
    }

    // Create new session
    const session = await QueueSession.create({
      userId: req.user.id,
      shedId,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      active: true,
      idempotencyKey: idempotencyKey || null, // Store for deduplication
    });

    // Recalculate (respects manual override)
    const updatedShed = await recalculateShedQueue(shedId);

    res.status(201).json({ 
      sessionId: session._id,
      message: "Successfully joined queue",
      session, 
      shed: updatedShed 
    });
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

// VALIDATE SESSION (Called on app resume to sync AsyncStorage with backend)
const validateSession = async (req, res) => {
  try {
    const activeSession = await QueueSession.findOne({
      userId: req.user.id,
      active: true
    }).populate('shedId');

    if (!activeSession) {
      return res.status(200).json({ 
        isValid: false,
        message: "No active queue session",
        session: null 
      });
    }

    // ✅ Session is valid and active
    res.status(200).json({
      isValid: true,
      sessionId: activeSession._id,
      shedId: activeSession.shedId._id,
      joinedAt: activeSession.joinedAt,
      shedDetails: {
        name: activeSession.shedId.name,
        queueStatus: activeSession.shedId.queueStatus,
        queueCount: activeSession.shedId.queueCount,
        waitTime: activeSession.shedId.waitTime,
      },
      message: "Session is active"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  validateSession,
  autoLeaveOldSessions,
};