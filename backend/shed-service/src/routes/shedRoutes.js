const express = require("express");

const {
  createShed,
  getNearbySheds,
  updateFuelStock,
  updateQueueStatus,
} = require("../controllers/shedController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// PUBLIC
router.get("/nearby", getNearbySheds);


// SHED OWNER ONLY
router.post(
  "/",
  protect,
  authorizeRoles("SHED_OWNER"),
  createShed
);


router.patch(
  "/:id/stock",
  protect,
  authorizeRoles("SHED_OWNER"),
  updateFuelStock
);


router.patch(
  "/:id/queue",
  protect,
  authorizeRoles("SHED_OWNER"),
  updateQueueStatus
);

module.exports = router;