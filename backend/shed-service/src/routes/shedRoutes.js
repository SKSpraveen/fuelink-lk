const express = require("express");

const {
  createShed,
  getNearbySheds,
  getMySheds,
  getShedById,
  updateFuelStock,
  updateQueueStatus,
} = require("../controllers/shedController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// PUBLIC
router.get("/nearby-sheds", getNearbySheds);


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