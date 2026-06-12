const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

chatSchema.virtual('chatId').get(function() {
  return this._id.toHexString();
});
chatSchema.set('toJSON', { virtuals: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
