import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CreateTask() {
  const navigate = useNavigate();

  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/tasks/create", task);

      alert("Task Created Successfully");
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || err.message);
      console.log(err.response?.data);
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto" }}>
      <h1>Create Task</h1>

      <form onSubmit={createTask}>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="assignedTo"
          placeholder="Assigned To"
          onChange={handleChange}
        />
        <br /><br />

        <select name="priority" onChange={handleChange}>
          <option>Low</option>
          <option selected>Medium</option>
          <option>High</option>
        </select>

        <br /><br />

        <select name="status" onChange={handleChange}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <br /><br />

        <input
          type="date"
          name="dueDate"
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Create Task
        </button>
      </form>
    </div>
  );
}
