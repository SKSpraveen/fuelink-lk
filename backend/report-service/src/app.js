const express = require('express');
const Report = require('./models/Report');
const app = express();

app.use(express.json());

const validReportTypes = ['EMPTY', 'LONG_QUEUE', 'SHORT_QUEUE', 'AVAILABLE'];

app.post('/submit', async (req, res) => {
  try {
    const { shedId, reportType } = req.body;

    if (!shedId || !reportType) {
      return res.status(400).json({ success: false, message: 'shedId and reportType are required' });
    }

    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ success: false, message: 'Invalid reportType' });
    }

    const report = new Report({ shedId, reportType });
    await report.save();

    res.status(200).json({ success: true, message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

app.get('/reports/:shedId', async (req, res) => {
  try {
    const { shedId } = req.params;
    const reports = await Report.find({ shedId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = app;
