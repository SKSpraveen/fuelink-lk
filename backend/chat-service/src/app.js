const express = require('express');
const cors = require('cors');
const Chat = require('./models/Chat');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/message', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const newChat = new Chat({
      senderId,
      receiverId,
      message
    });

    await newChat.save();

    res.status(201).json({ success: true, message: 'Message sent successfully', data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.get('/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Fetch historical messages involving the chatId (e.g., if it's a user ID)
    const messages = await Chat.find({
      $or: [
        { senderId: chatId },
        { receiverId: chatId }
      ]
    }).sort({ createdAt: 1 });
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = app;
