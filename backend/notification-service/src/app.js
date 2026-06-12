const express = require('express');
const app = express();

app.use(express.json());

const admin = require('firebase-admin');
const Notification = require('./models/Notification');

app.post('/send-alert', async (req, res) => {
  const { userId, message, fcmToken } = req.body;
  
  try {
    const notification = new Notification({ userId, message, fcmToken });
    await notification.save();

    // Do not initialize app, just mock it
    console.log(`[MOCK] Sending FCM to ${fcmToken}: ${message}`);

    res.status(200).json({ success: true, message: 'Alert sent successfully' });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ success: false, error: 'Failed to send alert' });
  }
});

module.exports = app;
