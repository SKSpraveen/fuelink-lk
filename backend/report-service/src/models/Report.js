const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  shedId: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    required: true
  }
}, { timestamps: true });

reportSchema.virtual('reportId').get(function() {
  return this._id.toHexString();
});
reportSchema.set('toJSON', { virtuals: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
