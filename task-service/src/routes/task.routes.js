
// Task CRUD routes placeholder

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Service API Working",
  });
});

router.post("/create", authMiddleware, createTask);
router.get("/all", authMiddleware, getAllTasks);
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
