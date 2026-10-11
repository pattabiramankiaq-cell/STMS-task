import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/tasks/all");
      setTasks(res.data.tasks);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/tasks/${id}`);
      alert("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task");
      console.log(err.response?.data || err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard</h1>

      <button
        onClick={() => navigate("/create")}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        + Create Task
      </button>

      <h2>My Tasks</h2>

      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.assignedTo}</td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>{task.dueDate?.substring(0, 10)}</td>

              <td>
                <button
                  onClick={() => handleEdit(task._id)}
                  style={{
                    marginRight: "10px",
                    padding: "6px 12px",
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(task._id)}
                  style={{
                    padding: "6px 12px",
                    background: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


