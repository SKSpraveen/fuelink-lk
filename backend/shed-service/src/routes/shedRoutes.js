const express = require("express");

const {
  createShed,
  getNearbySheds,
  getMySheds,
  getShedById,
  updateFuelStock,
  updateQueueStatus,
  joinQueue,
  leaveQueue,
  validateSession,
} = require("../controllers/shedController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// PUBLIC
router.get("/nearby-sheds", getNearbySheds);

// AUTHENTICATED USERS
router.post("/join-queue", protect, joinQueue);
router.post("/leave-queue", protect, leaveQueue);
router.get("/validate-session", protect, validateSession);


// SHED OWNER ONLY
router.get(
  "/my-sheds",
  protect,
  authorizeRoles("SHED_OWNER"),
  getMySheds
);

router.post(
  "/",
  protect,
  authorizeRoles("SHED_OWNER"),
  createShed
);


router.post(
  "/update-stock",
  protect,
  authorizeRoles("SHED_OWNER"),
  updateFuelStock
);


router.post(
  "/update-queue",
  protect,
  authorizeRoles("SHED_OWNER"),
  updateQueueStatus
);

router.get("/:id", getShedById);

module.exports = router;