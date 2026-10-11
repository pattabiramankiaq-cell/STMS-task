// Report controller placeholder


const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createReport
};
