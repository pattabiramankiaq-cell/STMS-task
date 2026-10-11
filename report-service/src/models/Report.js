// Report mongoose model placeholder

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    pendingTasks: {
      type: Number,
      default: 0
    },
    overdueTasks: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Report", reportSchema);


