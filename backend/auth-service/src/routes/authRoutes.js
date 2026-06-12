const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  verifyOtp,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// PUBLIC ROUTES

    // REGISTER
router.post("/register", registerUser);
   // LOGIN
router.post("/login", loginUser);
   // VERIFY OTP
router.post("/verify-otp", verifyOtp);

// PROTECTED ROUTE
router.get("/me", protect, getMe);

// ADMIN ONLY ROUTE
router.get(
  "/admin",
  protect,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Admin",
    });
  }
);


// SHED OWNER ONLY ROUTE
router.get(
  "/shed-owner",
  protect,
  authorizeRoles("SHED_OWNER"),
  (req, res) => {
    res.json({
      message: "Welcome Shed Owner",
    });
  }
);


module.exports = router;